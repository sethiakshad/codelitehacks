import { Router } from "express";
import Message from "../models/messages.model.js";
import Deal from "../models/deals.model.js";
import auth from "../middleware/auth.js";

const router = Router();

// GET /api/messages/:dealId — Fetch chat history for a deal
router.get("/:dealId", auth, async (req, res) => {
    try {
        const { dealId } = req.params;

        // Verify user is part of the deal
        const deal = await Deal.findById(dealId);
        if (!deal) return res.status(404).json({ message: "Deal not found." });

        if (deal.buyer_id.toString() !== req.user.id && deal.seller_id.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to view this chat." });
        }

        const messages = await Message.find({ deal_id: dealId }).sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error fetching messages." });
    }
});

export default router;
