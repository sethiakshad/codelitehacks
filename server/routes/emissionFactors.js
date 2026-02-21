import { Router } from "express";
import pool from "../config/database.js";
import auth from "../middleware/auth.js";

const router = Router();

// GET /api/emission-factors
router.get("/", auth, async (req, res) => {
    try {
        const { waste_type } = req.query;
        let query = "SELECT * FROM emission_factors ORDER BY created_at DESC";
        const params = [];
        if (waste_type) {
            query = "SELECT * FROM emission_factors WHERE waste_type = $1 ORDER BY created_at DESC";
            params.push(waste_type);
        }
        const result = await pool.query(query, params);
        res.status(200).json({ data: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

// GET /api/emission-factors/:id
router.get("/:id", auth, async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM emission_factors WHERE id = $1", [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Emission factor not found." });
        res.status(200).json({ data: result.rows[0] });
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
        const result = await pool.query(
            `INSERT INTO emission_factors (waste_type, co2_saved_per_ton, landfill_diversion_factor)
             VALUES ($1, $2, $3) RETURNING *`,
            [waste_type, co2_saved_per_ton, landfill_diversion_factor]
        );
        res.status(201).json({ data: result.rows[0], message: "Emission factor created." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

// PUT /api/emission-factors/:id
router.put("/:id", auth, async (req, res) => {
    const { waste_type, co2_saved_per_ton, landfill_diversion_factor } = req.body;
    try {
        const result = await pool.query(
            `UPDATE emission_factors SET waste_type=$1, co2_saved_per_ton=$2, landfill_diversion_factor=$3
             WHERE id=$4 RETURNING *`,
            [waste_type, co2_saved_per_ton, landfill_diversion_factor, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: "Emission factor not found." });
        res.status(200).json({ data: result.rows[0], message: "Emission factor updated." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

// DELETE /api/emission-factors/:id
router.delete("/:id", auth, async (req, res) => {
    try {
        const result = await pool.query("DELETE FROM emission_factors WHERE id = $1 RETURNING id", [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Emission factor not found." });
        res.status(200).json({ message: "Emission factor deleted." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

export default router;
