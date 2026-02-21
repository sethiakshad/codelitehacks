import { Router } from "express";
import pool from "../config/database.js";
import auth from "../middleware/auth.js";

const router = Router();

// GET /api/waste-profiles — list all (optionally filter by factory)
router.get("/", auth, async (req, res) => {
    try {
        const { factory_id } = req.query;
        let query = "SELECT * FROM factory_waste_profiles ORDER BY created_at DESC";
        const params = [];
        if (factory_id) {
            query = "SELECT * FROM factory_waste_profiles WHERE factory_id = $1 ORDER BY created_at DESC";
            params.push(factory_id);
        }
        const result = await pool.query(query, params);
        res.status(200).json({ data: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

// GET /api/waste-profiles/:id
router.get("/:id", auth, async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM factory_waste_profiles WHERE id = $1", [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Waste profile not found." });
        res.status(200).json({ data: result.rows[0] });
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
        const result = await pool.query(
            `INSERT INTO factory_waste_profiles (factory_id, waste_type, average_quantity_per_month, hazardous, storage_condition)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [factory_id, waste_type, average_quantity_per_month, hazardous || false, storage_condition]
        );
        res.status(201).json({ data: result.rows[0], message: "Waste profile created." });
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
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
    const values = [...Object.values(fields), req.params.id];
    try {
        const result = await pool.query(
            `UPDATE factory_waste_profiles SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`, values
        );
        if (result.rows.length === 0) return res.status(404).json({ message: "Waste profile not found." });
        res.status(200).json({ data: result.rows[0], message: "Waste profile updated." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

// DELETE /api/waste-profiles/:id
router.delete("/:id", auth, async (req, res) => {
    try {
        const result = await pool.query("DELETE FROM factory_waste_profiles WHERE id = $1 RETURNING id", [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Waste profile not found." });
        res.status(200).json({ message: "Waste profile deleted." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

export default router;
