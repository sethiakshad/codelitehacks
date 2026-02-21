import { Router } from "express";
import Requirement from "../models/requirements.model.js";
import auth from "../middleware/auth.js";

const router = Router();

// GET /api/requirements — list all requirements for the logged-in user
router.get("/", auth, async (req, res) => {
    try {
        const requirements = await Requirement.find({ user_id: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ data: requirements });
    } catch (err) {
        console.error("GET Requirements Error:", err);
        res.status(500).json({ message: "Server error fetching requirements." });
    }
});

// POST /api/requirements — create a new requirement
router.post("/", auth, async (req, res) => {
    const { material, qty, priority } = req.body;

    if (!material || !qty) {
        return res.status(400).json({ message: "Material and quantity are required." });
    }

    try {
        const newRequirement = await Requirement.create({
            user_id: req.user.id,
            material,
            qty,
            priority: priority || "Medium"
        });

        res.status(201).json({ data: newRequirement, message: "Requirement added successfully." });
    } catch (err) {
        console.error("POST Requirement Error:", err);
        res.status(500).json({ message: "Server error adding requirement." });
    }
});

// PUT /api/requirements/:id — update an existing requirement
router.put("/:id", auth, async (req, res) => {
    const { material, qty, priority, matched } = req.body;

    try {
        const requirement = await Requirement.findOneAndUpdate(
            { _id: req.params.id, user_id: req.user.id },
            { $set: { material, qty, priority, matched } },
            { new: true, runValidators: true }
        );

        if (!requirement) {
            return res.status(404).json({ message: "Requirement not found or unauthorized." });
        }

        res.status(200).json({ data: requirement, message: "Requirement updated successfully." });
    } catch (err) {
        console.error("PUT Requirement Error:", err);
        res.status(500).json({ message: "Server error updating requirement." });
    }
});

// DELETE /api/requirements/:id — delete a requirement
router.delete("/:id", auth, async (req, res) => {
    try {
        const requirement = await Requirement.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });

        if (!requirement) {
            return res.status(404).json({ message: "Requirement not found or unauthorized." });
        }

        res.status(200).json({ message: "Requirement deleted successfully." });
    } catch (err) {
        console.error("DELETE Requirement Error:", err);
        res.status(500).json({ message: "Server error deleting requirement." });
    }
});

export default router;
