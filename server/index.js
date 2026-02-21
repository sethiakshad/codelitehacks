import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

import connectDB from "./config/database.js";

// Connect to MongoDB
connectDB();

// Routes
import authRoutes from "./routes/auth.js";
import factoryRoutes from "./routes/factories.js";
import wasteProfileRoutes from "./routes/wasteProfiles.js";
import productionScheduleRoutes from "./routes/productionSchedules.js";
import wasteRatioRoutes from "./routes/wasteRatios.js";
import emissionFactorRoutes from "./routes/emissionFactors.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
    res.json({ status: "ok", message: "CODELITE API is running." });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/factories", factoryRoutes);
app.use("/api/waste-profiles", wasteProfileRoutes);
app.use("/api/production-schedules", productionScheduleRoutes);
app.use("/api/waste-ratios", wasteRatioRoutes);
app.use("/api/emission-factors", emissionFactorRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});