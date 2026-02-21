import { Router } from "express";
import Deal from "../models/deals.model.js";
import EmissionFactor from "../models/emissionFactors.model.js";
import FactoryWasteProfile from "../models/factoryWasteProfiles.model.js";
import User from "../models/users.model.js";
import auth from "../middleware/auth.js";

export default function (io) {
    const router = Router();

    // POST /api/deals — Initiate a new deal
    router.post("/", auth, async (req, res) => {
        const { listing_id, quantity } = req.body;

        try {
            const listing = await FactoryWasteProfile.findById(listing_id).populate("factory_id");
            if (!listing) return res.status(404).json({ message: "Listing not found." });

            const sellerUser = await User.findOne({ factory_id: listing.factory_id });

            // Fetch Emission Factors for the material
            let virgin_ef = 2.5; // fallbacks if missing
            let recycled_ef = 0.8;

            const efRecord = await EmissionFactor.findOne({ waste_type: listing.waste_type });
            if (efRecord && efRecord.virgin_emission_factor && efRecord.recycled_emission_factor) {
                virgin_ef = efRecord.virgin_emission_factor;
                recycled_ef = efRecord.recycled_emission_factor;
            }

            // CO2 Saved Calculation
            // CO2 Saved = (Virgin - Recycled) * Quantity
            const co2_saved = (virgin_ef - recycled_ef) * Number(quantity);
            const landfill_diverted = Number(quantity);

            const deal = await Deal.create({
                buyer_id: req.user.id,
                seller_id: sellerUser ? sellerUser._id : listing.factory_id, // fallback if user not found
                listing_id: listing._id,
                quantity: Number(quantity),
                co2_saved,
                landfill_diverted,
                status: "Pending"
            });

            // Populate the deal
            await deal.populate("buyer_id", "name email");
            await deal.populate("listing_id", "waste_type");

            // REAL-TIME WEBSOCKET: Notify the Seller
            if (sellerUser) {
                io.to(sellerUser._id.toString()).emit("new_deal", {
                    message: `New deal initiated for ${listing.waste_type}!`,
                    deal
                });
            }

            res.status(201).json({ data: deal, message: "Deal initiated successfully." });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error creating deal." });
        }
    });

    // GET /api/deals — Get deals for logged-in user (bought or sold)
    router.get("/", auth, async (req, res) => {
        try {
            const deals = await Deal.find({
                $or: [{ buyer_id: req.user.id }, { seller_id: req.user.id }]
            })
                .populate("buyer_id", "name")
                .populate("seller_id", "name")
                .populate("listing_id")
                .sort({ createdAt: -1 });

            res.status(200).json({ data: deals });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error fetching deals." });
        }
    });

    return router;
}
