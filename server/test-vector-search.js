import { generateEmbedding, cosineSimilarity } from "./utils/embeddings.js";

async function runTest() {
    console.log("Generating Buyer Embedding... (Requirement for Plastic)");
    const reqText = "Waste Type: Plastic, Quantity: 500, Hazardous: false, Priority: High";
    const reqEmbedding = await generateEmbedding(reqText);

    console.log("Generating Seller 1 Embedding... (Selling Plastic)");
    const seller1Text = "Waste Type: Plastic, Quantity: 500, Hazardous: false, Storage: Any";
    const seller1Embedding = await generateEmbedding(seller1Text);

    console.log("Generating Seller 2 Embedding... (Selling Copper)");
    const seller2Text = "Waste Type: Copper, Quantity: 100, Hazardous: true, Storage: Dry";
    const seller2Embedding = await generateEmbedding(seller2Text);

    if (reqEmbedding.length > 0) {
        console.log("Calculating Cosine Similarities:");
        console.log("Match % with Plastic Seller:", Math.round(cosineSimilarity(reqEmbedding, seller1Embedding) * 100) + "%");
        console.log("Match % with Copper Seller:", Math.round(cosineSimilarity(reqEmbedding, seller2Embedding) * 100) + "%");
    } else {
        console.log("Failed to generate embedding array.");
    }
}

runTest();
