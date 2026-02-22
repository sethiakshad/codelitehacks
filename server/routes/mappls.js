import express from "express";
import axios from "axios";

const router = express.Router();

// Proxy for Mappls Auth (Token)
router.post("/auth", async (req, res) => {
    try {
        console.log("[Mappls Auth] Requesting new token...");
        const response = await axios.post("https://outpost.mappls.com/api/security/oauth/token",
            new URLSearchParams({
                grant_type: "client_credentials",
                client_id: process.env.MAPPLS_CLIENT_ID,
                client_secret: process.env.MAPPLS_CLIENT_SECRET,
            }),
            {
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            }
        );
        console.log("[Mappls Auth] Token received successfully.");
        res.json(response.data);
    } catch (error) {
        console.error("Mappls Auth Proxy Error Details:", {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        res.status(error.response?.status || 500).json(error.response?.data || { message: "Auth proxy failed" });
    }
});

// Proxy for Mappls Search (Nearby)
router.get("/search", async (req, res) => {
    try {
        const { keywords, refLocation, radius, explain, richData } = req.query;
        const authHeader = req.headers.authorization;

        console.log(`[Mappls Search] Requesting search for: ${refLocation}`);
        console.log(`[Mappls Search] Authorization Header: ${authHeader ? (authHeader.substring(0, 15) + "...") : "MISSING"}`);

        const response = await axios.get("https://atlas.mappls.com/api/places/nearby/json", {
            params: { keywords, refLocation, radius, explain, richData },
            headers: { Authorization: authHeader }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Mappls Search Proxy Error Details:", {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        res.status(error.response?.status || 500).json(error.response?.data || { message: "Search proxy failed" });
    }
});

export default router;
