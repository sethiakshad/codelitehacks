import { Router } from "express";
import User from "../models/users.model.js";
import auth from "../middleware/auth.js";

const router = Router();

// GET /api/users — list all users (admin use)
router.get("/", auth, async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.status(200).json({
            data: users,
            message: "Users fetched successfully"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

// GET /api/users/:id — get single user
router.get("/:id", auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found." });
        res.status(200).json({ data: user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

export default router;
