import { Router } from "express";
import FactoryWasteProfile from "../models/factoryWasteProfiles.model.js";
import auth from "../middleware/auth.js";
import { generateEmbedding } from "../utils/embeddings.js";

const router = Router();

// GET /api/waste-profiles — list all (optionally filter by factory or user)
router.get("/", auth, async (req, res) => {
    try {
        const { factory_id, user_id } = req.query;
        let query = {};
        if (factory_id) query.factory_id = factory_id;
        if (user_id) query.user_id = user_id;

        const profiles = await FactoryWasteProfile.find(query).sort({ createdAt: -1 }).populate("user_id", "name email");
        res.status(200).json(profiles);
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
        res.status(200).json(profile);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

// POST /api/waste-profiles
router.post("/", auth, async (req, res) => {
    const { factory_id, user_id, waste_type, average_quantity_per_month, hazardous, storage_condition } = req.body;
    if (!waste_type) {
        return res.status(400).json({ message: "waste_type is required." });
    }
    try {
        const textToEmbed = `Waste Type: ${waste_type}, Quantity: ${average_quantity_per_month || 'Unknown'}, Hazardous: ${hazardous || false}, Storage: ${storage_condition || 'Any'}`;
        const embedding = await generateEmbedding(textToEmbed);

        const profile = await FactoryWasteProfile.create({
            factory_id,
            user_id: user_id || req.user.id,
            waste_type,
            average_quantity_per_month,
            hazardous: hazardous || false,
            storage_condition,
            embedding
        });
        res.status(201).json(profile);
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
        // Regenerate embedding if characteristics changed
        if (fields.waste_type || fields.average_quantity_per_month !== undefined || fields.hazardous !== undefined || fields.storage_condition) {
            // we need the existing profile first to build a full string
            const existing = await FactoryWasteProfile.findById(req.params.id);
            if (!existing) return res.status(404).json({ message: "Waste profile not found." });

            const wtype = fields.waste_type || existing.waste_type;
            const qty = fields.average_quantity_per_month !== undefined ? fields.average_quantity_per_month : existing.average_quantity_per_month;
            const haz = fields.hazardous !== undefined ? fields.hazardous : existing.hazardous;
            const stg = fields.storage_condition || existing.storage_condition;

            const textToEmbed = `Waste Type: ${wtype}, Quantity: ${qty || 'Unknown'}, Hazardous: ${haz || false}, Storage: ${stg || 'Any'}`;
            fields.embedding = await generateEmbedding(textToEmbed);
        }

        const profile = await FactoryWasteProfile.findByIdAndUpdate(
            req.params.id,
            { $set: fields },
            { new: true, runValidators: true }
        );
        if (!profile) return res.status(404).json({ message: "Waste profile not found." });
        res.status(200).json(profile);
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
