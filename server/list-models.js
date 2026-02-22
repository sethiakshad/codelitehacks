import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

async function list() {
    try {
        const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const models = await client.models.list();
        for await (const model of models) {
            // console.log(model.name);
            if (model.name.includes("embed") || model.name.includes("embedding")) {
                console.log(model.name);
            }
        }
    } catch (err) {
        console.error(err);
    }
}
list();
