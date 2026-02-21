import { Router } from "express";
import pool from "../config/database.js";
import auth from "../middleware/auth.js";

const router = Router();

// GET /api/factories — list all
router.get("/", auth, async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM factories ORDER BY created_at DESC");
        res.status(200).json({ data: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

// GET /api/factories/:id — get one
router.get("/:id", auth, async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM factories WHERE id = $1", [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Factory not found." });
        res.status(200).json({ data: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

// POST /api/factories — create
router.post("/", auth, async (req, res) => {
    const {
        name, industry_type, registration_number, contact_person, email, phone,
        address, city, state, country, latitude, longitude,
        annual_production_capacity, number_of_employees,
        esg_rating, circularity_score,
        hazardous_waste_license, iso_certified
    } = req.body;

    if (!name || !industry_type) {
        return res.status(400).json({ message: "Name and industry_type are required." });
    }

    try {
        const result = await pool.query(
            `INSERT INTO factories (
                name, industry_type, registration_number, contact_person, email, phone,
                address, city, state, country, latitude, longitude,
                annual_production_capacity, number_of_employees,
                esg_rating, circularity_score, hazardous_waste_license, iso_certified
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
            RETURNING *`,
            [
                name, industry_type, registration_number, contact_person, email, phone,
                address, city, state, country || "India", latitude, longitude,
                annual_production_capacity, number_of_employees,
                esg_rating, circularity_score || 0, hazardous_waste_license || false, iso_certified || false
            ]
        );
        res.status(201).json({ data: result.rows[0], message: "Factory created successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

// PUT /api/factories/:id — update
router.put("/:id", auth, async (req, res) => {
    const fields = req.body;
    const keys = Object.keys(fields);
    if (keys.length === 0) return res.status(400).json({ message: "No fields to update." });

    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
    const values = [...Object.values(fields), req.params.id];

    try {
        const result = await pool.query(
            `UPDATE factories SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${keys.length + 1} RETURNING *`,
            values
        );
        if (result.rows.length === 0) return res.status(404).json({ message: "Factory not found." });
        res.status(200).json({ data: result.rows[0], message: "Factory updated." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

// DELETE /api/factories/:id — delete
router.delete("/:id", auth, async (req, res) => {
    try {
        const result = await pool.query("DELETE FROM factories WHERE id = $1 RETURNING id", [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Factory not found." });
        res.status(200).json({ message: "Factory deleted." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

export default router;
