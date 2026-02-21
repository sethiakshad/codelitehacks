import { Router } from "express";
import ProductionSchedule from "../models/productionSchedules.model.js";
import auth from "../middleware/auth.js";

const router = Router();

// GET /api/production-schedules
router.get("/", auth, async (req, res) => {
    try {
        const { factory_id } = req.query;
        let query = {};
        if (factory_id) {
            query.factory_id = factory_id;
        }
        const schedules = await ProductionSchedule.find(query).sort({ production_month: -1 });
        res.status(200).json({ data: schedules });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

// GET /api/production-schedules/:id
router.get("/:id", auth, async (req, res) => {
    try {
        const schedule = await ProductionSchedule.findById(req.params.id);
        if (!schedule) return res.status(404).json({ message: "Schedule not found." });
        res.status(200).json({ data: schedule });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

// POST /api/production-schedules
router.post("/", auth, async (req, res) => {
    const { factory_id, product_type, production_volume, production_month } = req.body;
    if (!factory_id || !production_month) {
        return res.status(400).json({ message: "factory_id and production_month are required." });
    }
    try {
        const schedule = await ProductionSchedule.create({
            factory_id, product_type, production_volume, production_month
        });
        res.status(201).json({ data: schedule, message: "Production schedule created." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

// PUT /api/production-schedules/:id
router.put("/:id", auth, async (req, res) => {
    const fields = req.body;
    const keys = Object.keys(fields);
    if (keys.length === 0) return res.status(400).json({ message: "No fields to update." });

    try {
        const schedule = await ProductionSchedule.findByIdAndUpdate(
            req.params.id,
            { $set: fields },
            { new: true, runValidators: true }

        );
        if (!schedule) return res.status(404).json({ message: "Schedule not found." });
        res.status(200).json({ data: schedule, message: "Schedule updated." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

// DELETE /api/production-schedules/:id
router.delete("/:id", auth, async (req, res) => {
    try {
        const schedule = await ProductionSchedule.findByIdAndDelete(req.params.id);
        if (!schedule) return res.status(404).json({ message: "Schedule not found." });
        res.status(200).json({ message: "Production schedule deleted." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

export default router;
