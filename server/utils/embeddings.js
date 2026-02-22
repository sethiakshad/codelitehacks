import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
let client = null;

if (apiKey) {
    client = new GoogleGenAI({ apiKey });
}

/**
 * Generate a 768-dimensional vector embedding for the given text using Gemini.
 * @param {string} text - The input text to embed.
 * @returns {Promise<number[]>} - Array of numbers representing the embedding vector.
 */
export const generateEmbedding = async (text) => {
    if (!client) {
        console.warn("[Embeddings] Missing GEMINI_API_KEY. Cannot generate embedding.");
        return [];
    }

    if (!text || typeof text !== "string") {
        console.warn("[Embeddings] Invalid input text for embedding.");
        return [];
    }

    try {
        const response = await client.models.embedContent({
            model: "gemini-embedding-001",
            contents: text,
        });

        // The API returns an object with `embeddings` array
        if (response.embeddings && response.embeddings.length > 0) {
            return response.embeddings[0].values;
        }
        return [];
    } catch (err) {
        console.error("[Embeddings] Failed to generate embedding:", err.message);
        return [];
    }
};

/**
 * Fallback memory-based Cosine Similarity calculator
 * @param {number[]} vecA 
 * @param {number[]} vecB 
 * @returns {number} Score between -1 and 1
 */
export const cosineSimilarity = (vecA, vecB) => {
    if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};
