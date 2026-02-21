import { Router } from "express";
import Deal from "../models/deals.model.js";
import Formula from "../models/formulas.model.js";
import FactoryWasteProfile from "../models/factoryWasteProfiles.model.js";
import Factory from "../models/factories.model.js";
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

            let sellerUser = null;
            if (listing.user_id) {
                sellerUser = await User.findById(listing.user_id);
            } else if (listing.factory_id) {
                // Fallback for older listings: find the user who manages this factory by matching emails
                const factory = await Factory.findById(listing.factory_id);
                if (factory && factory.email) {
                    sellerUser = await User.findOne({ email: factory.email });
                }
            }

            // Fetch new Formula Factors for the material
            let virgin_ef = 2.5; // fallbacks if missing
            let recycled_ef = 0.8;

            const formulaObj = await Formula.findOne({ material: listing.waste_type });
            if (formulaObj && formulaObj.virgin && formulaObj.recycled) {
                virgin_ef = formulaObj.virgin;
                recycled_ef = formulaObj.recycled;
            }

            // CO2 Saved Calculation
            // CO2 Saved = (Virgin - Recycled) * Quantity
            const co2_saved = (virgin_ef - recycled_ef) * Number(quantity);
            const landfill_diverted = Number(quantity);

            const deal = await Deal.create({
                buyer_id: req.user.id,
                seller_id: sellerUser ? sellerUser._id : (listing.user_id || listing.factory_id),
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

    // PUT /api/deals/:id/status — Update deal status (e.g. Seller approves)
    router.put("/:id/status", auth, async (req, res) => {
        const { status } = req.body;

        try {
            const deal = await Deal.findById(req.params.id);
            if (!deal) return res.status(404).json({ message: "Deal not found." });

            // Only the seller can approve/complete the deal
            if (deal.seller_id.toString() !== req.user.id && status === "Completed") {
                return res.status(403).json({ message: "Only the seller can approve this deal." });
            }

            deal.status = status;
            await deal.save();

            // Notify the buyer
            if (status === "Completed") {
                io.to(deal.buyer_id.toString()).emit("deal_updated", {
                    message: "Your deal has been approved by the seller!",
                    deal
                });
            }

            res.status(200).json({ data: deal, message: `Deal marked as ${status}.` });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error updating deal." });
        }
    });

    return router;
}
