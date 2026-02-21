import { Router } from "express";
import EmissionFactor from "../models/emissionFactors.model.js";
import auth from "../middleware/auth.js";

const router = Router();

// GET /api/emission-factors
router.get("/", auth, async (req, res) => {
    try {
        const { waste_type } = req.query;
        const query = waste_type ? { waste_type } : {};
        const factors = await EmissionFactor.find(query).sort({ createdAt: -1 });
        res.status(200).json({ data: factors });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

// GET /api/emission-factors/:id
router.get("/:id", auth, async (req, res) => {
    try {
        const factor = await EmissionFactor.findById(req.params.id);
        if (!factor) return res.status(404).json({ message: "Emission factor not found." });
        res.status(200).json({ data: factor });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

// POST /api/emission-factors
router.post("/", auth, async (req, res) => {
    const { waste_type, co2_saved_per_ton, landfill_diversion_factor } = req.body;
    if (!waste_type) {
        return res.status(400).json({ message: "waste_type is required." });
    }
    try {
        const factor = await EmissionFactor.create({
            waste_type,
            co2_saved_per_ton,
            landfill_diversion_factor
        });
        res.status(201).json({ data: factor, message: "Emission factor created." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

// PUT /api/emission-factors/:id
router.put("/:id", auth, async (req, res) => {
    const { waste_type, co2_saved_per_ton, landfill_diversion_factor } = req.body;
    try {
        const factor = await EmissionFactor.findByIdAndUpdate(
            req.params.id,
            { $set: { waste_type, co2_saved_per_ton, landfill_diversion_factor } },
            { new: true, runValidators: true }
        );
        if (!factor) return res.status(404).json({ message: "Emission factor not found." });
        res.status(200).json({ data: factor, message: "Emission factor updated." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

// DELETE /api/emission-factors/:id
router.delete("/:id", auth, async (req, res) => {
    try {
        const factor = await EmissionFactor.findByIdAndDelete(req.params.id);
        if (!factor) return res.status(404).json({ message: "Emission factor not found." });
        res.status(200).json({ message: "Emission factor deleted." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

export default router;
