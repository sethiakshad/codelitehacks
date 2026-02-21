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
        const requirements = await Requirement.find({ user_id: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ data: requirements });
    } catch (err) {
        console.error("GET Requirements Error:", err);
        res.status(500).json({ message: "Server error fetching requirements." });
    }
});

// POST /api/requirements — create a new requirement
router.post("/", auth, async (req, res) => {
    const { material, qty, priority } = req.body;

    if (!material || !qty) {
        return res.status(400).json({ message: "Material and quantity are required." });
    }

    try {
        const newRequirement = await Requirement.create({
            user_id: req.user.id,
            material,
            qty,
            priority: priority || "Medium"
        });

        res.status(201).json({ data: newRequirement, message: "Requirement added successfully." });
    } catch (err) {
        console.error("POST Requirement Error:", err);
        res.status(500).json({ message: "Server error adding requirement." });
    }
});

// PUT /api/requirements/:id — update an existing requirement
router.put("/:id", auth, async (req, res) => {
    const { material, qty, priority, matched } = req.body;

    try {
        const requirement = await Requirement.findOneAndUpdate(
            { _id: req.params.id, user_id: req.user.id },
            { $set: { material, qty, priority, matched } },
            { new: true, runValidators: true }
        );

        if (!requirement) {
            return res.status(404).json({ message: "Requirement not found or unauthorized." });
        }

        res.status(200).json({ data: requirement, message: "Requirement updated successfully." });
    } catch (err) {
        console.error("PUT Requirement Error:", err);
        res.status(500).json({ message: "Server error updating requirement." });
    }
});

// DELETE /api/requirements/:id — delete a requirement
router.delete("/:id", auth, async (req, res) => {
    try {
        const requirement = await Requirement.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });

        if (!requirement) {
            return res.status(404).json({ message: "Requirement not found or unauthorized." });
        }

        res.status(200).json({ message: "Requirement deleted successfully." });
    } catch (err) {
        console.error("DELETE Requirement Error:", err);
        res.status(500).json({ message: "Server error deleting requirement." });
    }
});

// GET /api/requirements/:id/matches — Gemini AI Matcher against Marketplace
router.get("/:id/matches", auth, async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ message: "Gemini API key is not configured on the server." });
        }

        // 1. Get the specific Requirement
        const requirement = await Requirement.findOne({ _id: req.params.id, user_id: req.user.id });
        if (!requirement) return res.status(404).json({ message: "Requirement not found." });

        // 2. Fetch all active Marketplace Listings
        const listings = await FactoryWasteProfile.find()
            .populate("factory_id", "name city state")
            .populate("user_id", "name email");

        if (!listings || listings.length === 0) {
            return res.status(200).json({ data: [] });
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

        const prompt = `You are an expert Circular Economy AI Matchmaker.
I have a buyer who needs the following material:
- Material: ${requirement.material}
- Quantity Needed: ${requirement.qty}
- Priority/Timing: ${requirement.priority}

Here are the available marketplace listings (potential suppliers):
${JSON.stringify(listingsContext, null, 2)}

Your task is to analyze every single listing and determine how well it matches the buyer's requirement. 
Calculate a "match_percentage" (0 to 100) based strictly on these 4 factors:
1. Material Match: Exact material matches are required for a high score. Substituted materials score lower.
2. Volume Match: Does the supplier's quantity (and unit) closely align with the buyer's needed quantity? 
3. Location / Distance: Assume buyers prefer "Nearby companies". If the locations seem geographically close or are in the same region, boost the score. 
4. Timing Compatibility: Align the buyer's priority (High/Medium/Low) with the seller's availability.

Return EXACTLY a JSON array of objects, with NO markdown formatting. 
Format: [{"listing_id": "id string here", "match_percentage": 95, "reason": "Short 1 sentence reason explaining why this is a good match based on volume, location, and timing."}]
Only return listings with a score > 0. Sort the array descending by match_percentage.`;

        // 4. Call Gemini GenAI SDK
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.1, // Low temperature for deterministic evaluation
                responseMimeType: "application/json"
            }
        });

        const rawText = response.text || "[]";
        let aiResults = [];
        try {
            aiResults = JSON.parse(rawText);
        } catch (parseErr) {
            console.error("Failed to parse Gemini JSON:", rawText);
            return res.status(500).json({ message: "Failed to parse AI matching results." });
        }

        // 5. Hydrate the AI IDs back into full listing objects with CO2 math
        const formulas = await Formula.find();
        const formulaMap = {};
        formulas.forEach(f => {
            formulaMap[f.material.toLowerCase()] = f;
        });

        const populatedMatches = aiResults.map(aiHit => {
            const rawListing = listings.find(l => l._id.toString() === aiHit.listing_id);
            if (!rawListing) return null;

            const item = rawListing.toObject();
            const wasteTypeKey = (item.waste_type || "").replace(/\s+/g, '').toLowerCase();
            const aliases = { "iron": "steel", "ash": "flyash", "carbon": "flyash", "co2": "chemicalsolvent" };
            const formula = formulaMap[aliases[wasteTypeKey] || wasteTypeKey];

            item.potential_co2_savings_per_ton = (formula && formula.virgin && formula.recycled)
                ? (formula.virgin - formula.recycled)
                : 0;

            // Attach Gemini logic
            item.match_percentage = aiHit.match_percentage;
            item.match_reason = aiHit.reason;

            return item;
        }).filter(item => item !== null);

        res.status(200).json({ data: populatedMatches });

    } catch (err) {
        console.error("AI Matching Error:", err);
        res.status(500).json({ message: "Server error during AI matching process." });
    }
});

export default router;
