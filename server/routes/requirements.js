import { Router } from "express";
import Requirement from "../models/requirements.model.js";
import FactoryWasteProfile from "../models/factoryWasteProfiles.model.js";
import Formula from "../models/formulas.model.js";
import auth from "../middleware/auth.js";
import { GoogleGenAI } from "@google/genai";

const router = Router();

// GET /api/requirements — list all requirements for the logged-in user
router.get("/", auth, async (req, res) => {
    try {
        const requirements = await Requirement.find({ user_id: req.user.id });
        res.status(200).json(requirements);
    } catch (err) {
        console.error("Fetch requirements error:", err);
        res.status(500).json({ message: "Server error." });
    }
});

// POST /api/requirements — add a new requirement
router.post("/", auth, async (req, res) => {
    const { material, qty, priority } = req.body;
    try {
        const newReq = await Requirement.create({
            user_id: req.user.id,
            material,
            qty,
            priority
        });
        res.status(201).json(newReq);
    } catch (err) {
        console.error("Create requirement error:", err);
        res.status(500).json({ message: "Server error." });
    }
});

// PUT /api/requirements/:id — update a requirement
router.put("/:id", auth, async (req, res) => {
    try {
        const updated = await Requirement.findOneAndUpdate(
            { _id: req.params.id, user_id: req.user.id },
            req.body,
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: "Not found." });
        res.status(200).json(updated);
    } catch (err) {
        console.error("Update requirement error:", err);
        res.status(500).json({ message: "Server error." });
    }
});

// DELETE /api/requirements/:id — delete a requirement
router.delete("/:id", auth, async (req, res) => {
    try {
        const deleted = await Requirement.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
        if (!deleted) return res.status(404).json({ message: "Not found." });
        res.status(200).json({ message: "Deleted successfully." });
    } catch (err) {
        console.error("Delete requirement error:", err);
        res.status(500).json({ message: "Server error." });
    }
});

// GET /api/requirements/:id/matches — AI Matcher
router.get("/:id/matches", auth, async (req, res) => {
    try {
        console.log(`[AI MATCH] Start request for requirement ID: ${req.params.id}`);

        // 1. Fetch Requirement
        const requirement = await Requirement.findOne({ _id: req.params.id, user_id: req.user.id });
        if (!requirement) {
            console.error(`[AI MATCH] Requirement not found for ID: ${req.params.id}`);
            return res.status(404).json({ message: "Requirement not found." });
        }

        // 2. Fetch Listings
        const listings = await FactoryWasteProfile.find()
            .populate("factory_id", "name city state")
            .populate("user_id", "name email");

        if (!listings || listings.length === 0) {
            console.log("[AI MATCH] No marketplace listings found.");
            return res.status(200).json([]);
        }

        // 3. Generate embedding for the requirement
        const { generateEmbedding, cosineSimilarity } = await import("../utils/embeddings.js");
        const reqText = `Seeking Material: ${requirement.material}, Quantity Needed: ${requirement.qty}, Priority: ${requirement.priority}`;
        const reqEmbedding = await generateEmbedding(reqText);

        let populatedMatches = [];

        // 4. Try MongoDB Vector Search
        try {
            if (reqEmbedding.length > 0) {
                // We use an aggregation pipeline for vector search
                const atlasResults = await FactoryWasteProfile.aggregate([
                    {
                        "$vectorSearch": {
                            "index": "vector_index", // The name of the index in Atlas
                            "queryVector": reqEmbedding,
                            "path": "embedding",
                            "numCandidates": 100,
                            "limit": 10
                        }
                    },
                    {
                        "$project": {
                            "_id": 1,
                            "waste_type": 1,
                            "average_quantity_per_month": 1,
                            "unit": 1,
                            "factory_id": 1,
                            "user_id": 1,
                            "score": { "$meta": "vectorSearchScore" }
                        }
                    }
                ]);

                if (atlasResults && atlasResults.length > 0) {
                    // Populate factory and user data manually since aggregate doesn't run Mongoose middleware automatically in the same way
                    await FactoryWasteProfile.populate(atlasResults, { path: "factory_id", select: "name city state" });
                    await FactoryWasteProfile.populate(atlasResults, { path: "user_id", select: "name email" });

                    populatedMatches = atlasResults.map(item => {
                        const score = item.score || 0;
                        const matchPercentage = Math.round(score * 100);
                        return {
                            ...item,
                            match_percentage: matchPercentage > 100 ? 100 : matchPercentage,
                            match_reason: `Vector similarity score: ${score.toFixed(3)}`
                        };
                    }).sort((a, b) => {
                        if (b.match_percentage !== a.match_percentage) {
                            return b.match_percentage - a.match_percentage;
                        }
                        // Stable secondary sort
                        return String(a._id).localeCompare(String(b._id));
                    });
                    console.log(`[AI MATCH] Vector Search succeeded. Found ${populatedMatches.length} matches.`);
                }
            }
        } catch (vsErr) {
            console.warn(`[AI MATCH] Native $vectorSearch failed (likely index missing): ${vsErr.message}. Falling back to memory calculation...`);
        }

        // 5. Fallback: Memory-based Cosine Similarity if Vector Search failed or returned nothing
        if (populatedMatches.length === 0 && reqEmbedding.length > 0) {
            console.log("[AI MATCH] Using memory-based cosine similarity fallback.");
            populatedMatches = listings.map(listing => {
                const item = listing.toObject();
                let score = 0;
                if (item.embedding && item.embedding.length > 0) {
                    score = cosineSimilarity(reqEmbedding, item.embedding);
                }

                // Boost score slightly if exact material match (helps fallback logic)
                if (item.waste_type && requirement.material && item.waste_type.toLowerCase() === requirement.material.toLowerCase()) {
                    score = Math.min(1.0, score + 0.1);
                }

                const matchPercentage = Math.max(0, Math.round(score * 100));

                return {
                    ...item,
                    match_percentage: matchPercentage > 100 ? 100 : matchPercentage,
                    match_reason: score > 0.8 ? "High semantic similarity & exact material match" : "Semantic similarity match"
                };
            }).filter(item => item.match_percentage > 20) // Only return somewhat relevant results
                .sort((a, b) => {
                    if (b.match_percentage !== a.match_percentage) {
                        return b.match_percentage - a.match_percentage;
                    }
                    // Stable secondary sort
                    return String(a._id).localeCompare(String(b._id));
                }).slice(0, 10);
        }

        // 6. Hydrate with Formulas for CO2 Savings
        const formulas = await Formula.find();
        const formulaMap = {};
        formulas.forEach(f => { formulaMap[f.material.toLowerCase()] = f; });

        populatedMatches = populatedMatches.map(item => {
            const wasteTypeKey = (item.waste_type || "").replace(/\s+/g, '').toLowerCase();
            const formula = formulaMap[wasteTypeKey] || formulaMap["steel"]; // fallback for demo

            item.potential_co2_savings_per_ton = (formula && formula.virgin && formula.recycled)
                ? (formula.virgin - formula.recycled)
                : 0;

            return item;
        });

        console.log(`[AI MATCH] Returning ${populatedMatches.length} matches.`);
        res.status(200).json(populatedMatches);

    } catch (err) {
        console.error("[AI MATCH] Global Error:", err.message);
        res.status(500).json({ message: "Server AI matching error." });
    }
});

export default router;
