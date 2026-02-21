import { Router } from "express";
import FactoryWasteProfile from "../models/factoryWasteProfiles.model.js";
import auth from "../middleware/auth.js";

const router = Router();

// GET /api/waste-profiles — list all (optionally filter by factory)
router.get("/", auth, async (req, res) => {
    try {
        const { factory_id } = req.query;
        const query = factory_id ? { factory_id } : {};
        const profiles = await FactoryWasteProfile.find(query).sort({ createdAt: -1 });
        res.status(200).json({ data: profiles });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

// GET /api/waste-profiles/:id
router.get("/:id", auth, async (req, res) => {
    try {
        const profile = await FactoryWasteProfile.findById(req.params.id);
        if (!profile) return res.status(404).json({ message: "Waste profile not found." });
        res.status(200).json({ data: profile });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

// POST /api/waste-profiles
router.post("/", auth, async (req, res) => {
    const { factory_id, waste_type, average_quantity_per_month, hazardous, storage_condition } = req.body;
    if (!factory_id || !waste_type) {
        return res.status(400).json({ message: "factory_id and waste_type are required." });
    }
    try {
        const profile = await FactoryWasteProfile.create({
            factory_id,
            waste_type,
            average_quantity_per_month,
            hazardous: hazardous || false,
            storage_condition
        });
        res.status(201).json({ data: profile, message: "Waste profile created." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

// PUT /api/waste-profiles/:id
router.put("/:id", auth, async (req, res) => {
    const fields = req.body;
    const keys = Object.keys(fields);
    if (keys.length === 0) return res.status(400).json({ message: "No fields to update." });
    try {
        const profile = await FactoryWasteProfile.findByIdAndUpdate(
            req.params.id,
            { $set: fields },
            { new: true, runValidators: true }
        );
        if (!profile) return res.status(404).json({ message: "Waste profile not found." });
        res.status(200).json({ data: profile, message: "Waste profile updated." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

// DELETE /api/waste-profiles/:id
router.delete("/:id", auth, async (req, res) => {
    try {
        const profile = await FactoryWasteProfile.findByIdAndDelete(req.params.id);
        if (!profile) return res.status(404).json({ message: "Waste profile not found." });
        res.status(200).json({ message: "Waste profile deleted." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

export default router;
