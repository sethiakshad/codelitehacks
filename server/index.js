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
import messageRoutes from "./routes/messages.js";
import dealRoutesInit from "./routes/deals.js";
import Message from "./models/messages.model.js";

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

    socket.on("identify", (userId) => {
        if (!userId) return;
        socket.join(userId.toString());
        console.log(`User ${userId} joined their personal room.`);
    });

    socket.on("join_chat", (dealId) => {
        if (!dealId) return;
        socket.join(`deal:${dealId}`);
        console.log(`Socket ${socket.id} joined deal room: deal:${dealId}`);
    });

    socket.on("leave_chat", (dealId) => {
        if (!dealId) return;
        socket.leave(`deal:${dealId}`);
    });

    socket.on("send_message", async (data) => {
        const { deal_id, sender_id, text } = data;
        if (!deal_id || !sender_id || !text) return;

        try {
            const newMessage = await Message.create({ deal_id, sender_id, receiver_id: sender_id, text });
            io.to(`deal:${deal_id}`).emit("chat_message", newMessage);
        } catch (err) {
            console.error("Socket send_message error:", err);
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use("/api/messages", messageRoutes);
app.use("/api/deals", dealRoutesInit(io));

// ── Mappls API Proxy (for production — Vite proxy only works in dev) ──────────
app.post("/mappls-auth", async (req, res) => {
    try {
        const body = new URLSearchParams(req.body).toString();
        const response = await fetch("https://outpost.mappls.com/api/security/oauth/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
        });
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (err) {
        console.error("[Mappls Auth Proxy] Error:", err.message);
        res.status(500).json({ message: "Mappls auth proxy failed" });
    }
});

app.get("/mappls-search", async (req, res) => {
    try {
        const token = req.headers["authorization"];
        const params = new URLSearchParams(req.query).toString();
        const response = await fetch(`https://atlas.mappls.com/api/places/nearby/json?${params}`, {
            headers: { "Authorization": token },
        });
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (err) {
        console.error("[Mappls Search Proxy] Error:", err.message);
        res.status(500).json({ message: "Mappls search proxy failed" });
    }
});

// Final: Start Server & Connect DB
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`🚀 Server ready on port ${PORT}`);

    connectDB().then(() => {
        console.log("✅ MongoDB Connection logic initialized.");
    }).catch(err => {
        console.error("❌ MongoDB Initial Connection Failed:", err);
    });
});