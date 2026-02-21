import { Router } from "express";
import FactoryWasteProfile from "../models/factoryWasteProfiles.model.js";
import EmissionFactor from "../models/emissionFactors.model.js";

const router = Router();

// GET /api/marketplace — Get all active waste listings from all factories
router.get("/", async (req, res) => {
    try {
        const listings = await FactoryWasteProfile.find()
            .populate("factory_id", "name city state")
            .sort({ createdAt: -1 });

        // Let's attach some emission factor math to the listing so the UI can show "potential eco savings"
        const efs = await EmissionFactor.find();
        const efMap = {};
        efs.forEach(ef => {
            efMap[ef.waste_type] = ef;
        });

        const enrichedListings = listings.map(l => {
            const item = l.toObject();
            const ef = efMap[item.waste_type];
            let potential_co2_savings_per_ton = 1.7; // default
            if (ef && ef.virgin_emission_factor && ef.recycled_emission_factor) {
                potential_co2_savings_per_ton = ef.virgin_emission_factor - ef.recycled_emission_factor;
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
