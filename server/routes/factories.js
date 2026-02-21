import { Router } from "express";
import Factory from "../models/factories.model.js";
import auth from "../middleware/auth.js";
import multer from "multer";
import fs from "fs";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync("uploads")) {
            fs.mkdirSync("uploads");
        }
        cb(null, "uploads/")
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname)
    }
});
const upload = multer({ storage: storage });

const router = Router();

// GET /api/factories — list all
router.get("/", auth, async (req, res) => {
    try {
        const factories = await Factory.find().sort({ createdAt: -1 });
        res.status(200).json({ data: factories });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

// GET /api/factories/:id — get one
router.get("/:id", auth, async (req, res) => {
    try {
        const factory = await Factory.findById(req.params.id);
        if (!factory) return res.status(404).json({ message: "Factory not found." });
        res.status(200).json({ data: factory });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

// POST /api/factories — create
router.post("/", auth, upload.single("licenseFile"), async (req, res) => {
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
        const factory = await Factory.create({
            name, industry_type, registration_number, contact_person, email, phone,
            address, city, state, country: country || "India", latitude, longitude,
            annual_production_capacity, number_of_employees,
            esg_rating, circularity_score: circularity_score || 0,
            hazardous_waste_license: hazardous_waste_license || false,
            iso_certified: iso_certified || false
        });

        res.status(201).json({ data: factory, message: "Factory created successfully." });
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

    try {
        const factory = await Factory.findByIdAndUpdate(
            req.params.id,
            { $set: fields },
            { new: true, runValidators: true }
        );
        if (!factory) return res.status(404).json({ message: "Factory not found." });
        res.status(200).json({ data: factory, message: "Factory updated." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

// DELETE /api/factories/:id — delete
router.delete("/:id", auth, async (req, res) => {
    try {
        const factory = await Factory.findByIdAndDelete(req.params.id);
        if (!factory) return res.status(404).json({ message: "Factory not found." });
        res.status(200).json({ message: "Factory deleted." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

export default router;
