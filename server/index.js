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

    // Client can emit "identify" passing their user ID to join a private room
    socket.on("identify", (userId) => {
        if (!userId) return;
        const roomName = userId.toString();
        socket.join(roomName);
        console.log(`User ${roomName} joined their personal room.`);
    });

    // Chat Message Event
    socket.on("send_message", async (data) => {
        const { deal_id, sender_id, receiver_id, text } = data;
        if (!deal_id || !sender_id || !receiver_id || !text) return;

        try {
            // Save to DB
            const newMessage = await Message.create({ deal_id, sender_id, receiver_id, text });

            // Deliver to the receiver in real-time — use string room name
            io.to(receiver_id.toString()).emit("receive_message", newMessage);

            // Send back acknowledgment to the sender
            socket.emit("message_sent", newMessage);
        } catch (err) {
            console.error("Socket send_message error:", err);
        }
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
app.use("/api/messages", messageRoutes);
app.use("/api/deals", dealRoutesInit(io)); // Pass io to deals route

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server (with Socket.IO) is running on port ${PORT}`);
});