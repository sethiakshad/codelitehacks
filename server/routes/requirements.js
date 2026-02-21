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

        // 3. Prepare AI Prompt String
        const listingsContext = listings.map(l => ({
            id: l._id,
            material: l.waste_type,
            quantity: l.average_quantity_per_month,
            unit: l.unit,
            seller: l.factory_id?.name || l.user_id?.name || "Independent Seller",
            location: l.factory_id?.city || "Unknown Location",
            availability: l.availability_status || "Immediate"
        }));

        console.log(`[AI MATCH] Matching requirement for ${requirement.material}. Found ${listingsContext.length} total listings.`);

        const prompt = `You are an expert Circular Economy AI Matchmaker.
I have a buyer who needs the following material:
- Material: ${requirement.material}
- Quantity Needed: ${requirement.qty}
- Priority/Timing: ${requirement.priority}

Here are the available marketplace listings (potential suppliers):
${JSON.stringify(listingsContext, null, 2)}

Your task is to analyze every single listing and determine how well it matches the buyer's requirement. 
Calculate a "match_percentage" (0 to 100) based strictly on these 4 factors:
1. Material Match: Exact material matches are required for a high score.
2. Volume Match: Alignment of quantity and unit.
3. Location / Distance: Favor nearby companies.
4. Timing Compatibility: Buyer priority vs seller availability.

Return EXACTLY a JSON array of objects. NO markdown formatting.
Format: [{"listing_id": "id", "match_percentage": 95, "reason": "reason here"}]`;

        // 4. API check
        const apiKey = (process.env.GEMINI_API_KEY || "").trim();
        if (!apiKey) {
            console.error("[AI MATCH] GEMINI_API_KEY is missing!");
            return res.status(500).json({ message: "Server AI key missing." });
        }

        // 5. Call SDK
        const client = new GoogleGenAI({ apiKey });

        let result;
        try {
            result = await client.models.generateContent({
                model: "models/gemini-flash-latest",
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: {
                    temperature: 0.1,
                    responseMimeType: "application/json"
                }
            });
        } catch (sdkErr) {
            console.error("[AI MATCH] Gemini SDK Error:", sdkErr.message);
            return res.status(500).json({ message: "Gemini SDK Error: " + sdkErr.message });
        }

        let rawText = result.text || "[]";

        // Clean markdown backticks
        if (rawText.includes("```json")) {
            rawText = rawText.split("```json")[1].split("```")[0];
        } else if (rawText.includes("```")) {
            rawText = rawText.split("```")[1].split("```")[0];
        }
        rawText = rawText.trim();

        let aiResults = [];
        try {
            aiResults = JSON.parse(rawText);
        } catch (parseErr) {
            console.error("[AI MATCH] JSON Parse error:", rawText);
            return res.status(500).json({ message: "AI returned invalid JSON." });
        }

        // 6. Hydrate
        const formulas = await Formula.find();
        const formulaMap = {};
        formulas.forEach(f => { formulaMap[f.material.toLowerCase()] = f; });

        const populatedMatches = aiResults.map(aiHit => {
            const rawListing = listings.find(l => l._id.toString() === aiHit.listing_id);
            if (!rawListing) return null;

            const item = rawListing.toObject();
            const wasteTypeKey = (item.waste_type || "").replace(/\s+/g, '').toLowerCase();
            const formula = formulaMap[wasteTypeKey] || formulaMap["steel"]; // fallback for demo

            item.potential_co2_savings_per_ton = (formula && formula.virgin && formula.recycled)
                ? (formula.virgin - formula.recycled)
                : 0;

            item.match_percentage = aiHit.match_percentage;
            item.match_reason = aiHit.reason;

            return item;
        }).filter(item => item !== null)
            .sort((a, b) => b.match_percentage - a.match_percentage);

        console.log(`[AI MATCH] Returning ${populatedMatches.length} matches.`);
        res.status(200).json(populatedMatches);

    } catch (err) {
        console.error("[AI MATCH] Global Error:", err.message);
        res.status(500).json({ message: "Server AI matching error." });
    }
});

export default router;
