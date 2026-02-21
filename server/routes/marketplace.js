import { Router } from "express";
import FactoryWasteProfile from "../models/factoryWasteProfiles.model.js";
import Formula from "../models/formulas.model.js";

const router = Router();

// GET /api/marketplace — Get all active waste listings from all factories
router.get("/", async (req, res) => {
    try {
        const listings = await FactoryWasteProfile.find()
            .populate("factory_id", "name city state")
            .populate("user_id", "name email")
            .sort({ createdAt: -1 });

        // Attach exact formula emission math to listings from the new DB
        const formulas = await Formula.find();
        const formulaMap = {};
        formulas.forEach(f => {
            formulaMap[f.material.toLowerCase()] = f;
        });

        const enrichedListings = listings.map(l => {
            const item = l.toObject();
            // Normalize the waste type string to try and find a match
            let rawType = (item.waste_type || "").replace(/\s+/g, '').toLowerCase();

            // Simple aliases mapping for common user inputs
            const aliases = {
                "iron": "steel",
                "ash": "flyash",
                "carbon": "flyash",
                "co2": "chemicalsolvent"
            };

            const wasteTypeKey = aliases[rawType] || rawType;
            const formula = formulaMap[wasteTypeKey];

            let potential_co2_savings_per_ton = 0; // Default undefined material savings
            if (formula && formula.virgin && formula.recycled) {
                potential_co2_savings_per_ton = formula.virgin - formula.recycled;
            }
            item.potential_co2_savings_per_ton = potential_co2_savings_per_ton;
            return item;
        });

        res.status(200).json({ data: enrichedListings });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error fetching marketplace." });
    }
});

export default router;
