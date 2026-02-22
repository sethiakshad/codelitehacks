import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

async function list() {
    try {
        const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const models = await client.models.list();
        for await (const model of models) {
            if (model.name.includes("flash")) {
                console.log(model.name);
            }
        }
    } catch (err) {
        console.error(err);
    }
}
list();
