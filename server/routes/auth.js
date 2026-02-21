import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/users.model.js";
import authMiddleware from "../middleware/auth.js";

const router = Router();

// ─── POST /api/auth/register ─────────────────────────────────────────────────
router.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email and password are required." });
    }

    try {
        // Check if user already exists
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: "Email already registered." });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || "factory_manager"
        });

        // Sign token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ message: "Server error during registration." });
    }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server error during login." });
    }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────

router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found." });

        // Return id along with _id for compatibility
        const userData = user.toObject();
        userData.id = userData._id;

        res.status(200).json({ user: userData });
    } catch (err) {
        console.error("Me error:", err);
        res.status(500).json({ message: "Server error." });
    }
});

export default router;
