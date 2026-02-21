import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

import connectDB from "./config/database.js";

// Routes
import authRoutes from "./routes/auth.js";
import factoryRoutes from "./routes/factories.js";
import wasteProfileRoutes from "./routes/wasteProfiles.js";
import productionScheduleRoutes from "./routes/productionSchedules.js";
import wasteRatioRoutes from "./routes/wasteRatios.js";
import emissionFactorRoutes from "./routes/emissionFactors.js";
import requirementRoutes from "./routes/requirements.js";
import marketplaceRoutes from "./routes/marketplace.js";
import dealRoutesInit from "./routes/deals.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Socket.io Connection Logic
io.on("connection", (socket) => {
    console.log("A user connected via WebSocket:", socket.id);

    // Client can emit "identify" passing their user ID to join a private room
    socket.on("identify", (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their personal room.`);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// Middleware — must be before routes
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

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
app.use("/api/requirements", requirementRoutes);
app.use("/api/marketplace", marketplaceRoutes);
app.use("/api/deals", dealRoutesInit(io)); // Pass io to deals route

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server (with Socket.IO) is running on port ${PORT}`);
});