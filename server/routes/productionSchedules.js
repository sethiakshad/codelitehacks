import { Router } from "express";
import pool from "../config/database.js";
import auth from "../middleware/auth.js";

const router = Router();

// GET /api/production-schedules
router.get("/", auth, async (req, res) => {
    try {
        const { factory_id } = req.query;
        let query = "SELECT * FROM production_schedules ORDER BY production_month DESC";
        const params = [];
        if (factory_id) {
            query = "SELECT * FROM production_schedules WHERE factory_id = $1 ORDER BY production_month DESC";
            params.push(factory_id);
        }
        const result = await pool.query(query, params);
        res.status(200).json({ data: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

// GET /api/production-schedules/:id
router.get("/:id", auth, async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM production_schedules WHERE id = $1", [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Schedule not found." });
        res.status(200).json({ data: result.rows[0] });
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
        const result = await pool.query(
            `INSERT INTO production_schedules (factory_id, product_type, production_volume, production_month)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [factory_id, product_type, production_volume, production_month]
        );
        res.status(201).json({ data: result.rows[0], message: "Production schedule created." });
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
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
    const values = [...Object.values(fields), req.params.id];
    try {
        const result = await pool.query(
            `UPDATE production_schedules SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`, values
        );
        if (result.rows.length === 0) return res.status(404).json({ message: "Schedule not found." });
        res.status(200).json({ data: result.rows[0], message: "Schedule updated." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

// DELETE /api/production-schedules/:id
router.delete("/:id", auth, async (req, res) => {
    try {
        const result = await pool.query("DELETE FROM production_schedules WHERE id = $1 RETURNING id", [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Schedule not found." });
        res.status(200).json({ message: "Production schedule deleted." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

export default router;
