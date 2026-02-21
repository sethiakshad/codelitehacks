import { Router } from "express";
import pool from "../config/database.js";
import auth from "../middleware/auth.js";

const router = Router();

// GET /api/waste-ratios
router.get("/", auth, async (req, res) => {
    try {
        const { product_type } = req.query;
        let query = "SELECT * FROM waste_ratios";
        const params = [];
        if (product_type) {
            query += " WHERE product_type = $1";
            params.push(product_type);
        }
        const result = await pool.query(query, params);
        res.status(200).json({ data: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

// GET /api/waste-ratios/:id
router.get("/:id", auth, async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM waste_ratios WHERE id = $1", [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Waste ratio not found." });
        res.status(200).json({ data: result.rows[0] });
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
        const result = await pool.query(
            "INSERT INTO waste_ratios (product_type, waste_type, waste_ratio) VALUES ($1, $2, $3) RETURNING *",
            [product_type, waste_type, waste_ratio]
        );
        res.status(201).json({ data: result.rows[0], message: "Waste ratio created." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

// PUT /api/waste-ratios/:id
router.put("/:id", auth, async (req, res) => {
    const { product_type, waste_type, waste_ratio } = req.body;
    try {
        const result = await pool.query(
            "UPDATE waste_ratios SET product_type=$1, waste_type=$2, waste_ratio=$3 WHERE id=$4 RETURNING *",
            [product_type, waste_type, waste_ratio, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: "Waste ratio not found." });
        res.status(200).json({ data: result.rows[0], message: "Waste ratio updated." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

// DELETE /api/waste-ratios/:id
router.delete("/:id", auth, async (req, res) => {
    try {
        const result = await pool.query("DELETE FROM waste_ratios WHERE id = $1 RETURNING id", [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Waste ratio not found." });
        res.status(200).json({ message: "Waste ratio deleted." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

export default router;
