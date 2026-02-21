import { Router } from "express";
import WasteRatio from "../models/wasteRatios.model.js";
import auth from "../middleware/auth.js";

const router = Router();

// GET /api/waste-ratios
router.get("/", auth, async (req, res) => {
    try {
        const { product_type } = req.query;
        const query = product_type ? { product_type } : {};
        const ratios = await WasteRatio.find(query);
        res.status(200).json({ data: ratios });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

// GET /api/waste-ratios/:id
router.get("/:id", auth, async (req, res) => {
    try {
        const ratio = await WasteRatio.findById(req.params.id);
        if (!ratio) return res.status(404).json({ message: "Waste ratio not found." });
        res.status(200).json({ data: ratio });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

// POST /api/waste-ratios
router.post("/", auth, async (req, res) => {
    const { product_type, waste_type, waste_ratio } = req.body;
    if (!product_type || !waste_type || waste_ratio === undefined) {
        return res.status(400).json({ message: "product_type, waste_type, and waste_ratio are required." });
    }
    try {
        const ratio = await WasteRatio.create({ product_type, waste_type, waste_ratio });
        res.status(201).json({ data: ratio, message: "Waste ratio created." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

// PUT /api/waste-ratios/:id
router.put("/:id", auth, async (req, res) => {
    const { product_type, waste_type, waste_ratio } = req.body;
    try {
        const ratio = await WasteRatio.findByIdAndUpdate(
            req.params.id,
            { $set: { product_type, waste_type, waste_ratio } },
            { new: true, runValidators: true }
        );
        if (!ratio) return res.status(404).json({ message: "Waste ratio not found." });
        res.status(200).json({ data: ratio, message: "Waste ratio updated." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

// DELETE /api/waste-ratios/:id
router.delete("/:id", auth, async (req, res) => {
    try {
        const ratio = await WasteRatio.findByIdAndDelete(req.params.id);
        if (!ratio) return res.status(404).json({ message: "Waste ratio not found." });
        res.status(200).json({ message: "Waste ratio deleted." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

export default router;
