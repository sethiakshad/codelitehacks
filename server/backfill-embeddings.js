/**
 * Backfill script: Generates vector embeddings for ALL existing FactoryWasteProfile documents
 * that do not yet have an embedding stored in MongoDB.
 * 
 * Run once with:  node backfill-embeddings.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import FactoryWasteProfile from "./models/factoryWasteProfiles.model.js";
import { generateEmbedding } from "./utils/embeddings.js";

dotenv.config();

async function backfill() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("[Backfill] Connected to MongoDB.");

    // Find all documents that don't yet have an embedding
    const profiles = await FactoryWasteProfile.find({
        $or: [{ embedding: { $exists: false } }, { embedding: { $size: 0 } }, { embedding: null }]
    });

    console.log(`[Backfill] Found ${profiles.length} profiles without embeddings.`);

    let success = 0;
    let failed = 0;

    for (const profile of profiles) {
        const text = `Waste Type: ${profile.waste_type}, Quantity: ${profile.average_quantity_per_month || "Unknown"}, Hazardous: ${profile.hazardous || false}, Storage: ${profile.storage_condition || "Any"}`;
        const embedding = await generateEmbedding(text);

        if (embedding && embedding.length > 0) {
            profile.embedding = embedding;
            await profile.save();
            console.log(`  ✓ Embedded: ${profile.waste_type} (ID: ${profile._id})`);
            success++;
        } else {
            console.warn(`  ✗ Failed: ${profile.waste_type} (ID: ${profile._id})`);
            failed++;
        }
    }

    console.log(`\n[Backfill] Done. Success: ${success}, Failed: ${failed}`);
    await mongoose.disconnect();
    process.exit(0);
}

backfill().catch(err => {
    console.error("[Backfill] Error:", err);
    process.exit(1);
});
