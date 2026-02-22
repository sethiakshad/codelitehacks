import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Using API Key:", apiKey ? "FOUND" : "MISSING");
    if (!apiKey) return;

    try {
        const client = new GoogleGenAI({ apiKey, apiVersion: "v1" });
        console.log("Client created successfully (apiVersion: v1).");

        console.log("Calling generateContent with gemini-1.5-flash...");
        const response = await client.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [{ role: 'user', parts: [{ text: "Hi" }] }],
        });

    } catch (err) {
        console.error("Gemini Test Error:", err.message);
        console.error("Full Error details:", err);
    }
}

testGemini();
