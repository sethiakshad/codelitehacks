import mongoose from "mongoose";
import dotenv from "dotenv";
import Formula from "./models/formulas.model.js";

dotenv.config();

const emissionFactors = {
    Plastic: { virgin: 2.5, recycled: 0.8 },
    Aluminum: { virgin: 16.0, recycled: 0.5 },
    Steel: { virgin: 1.8, recycled: 0.7 },
    Paper: { virgin: 1.3, recycled: 0.6 },
    Glass: { virgin: 1.0, recycled: 0.3 },
    Copper: { virgin: 4.0, recycled: 1.2 },
    Cement: { virgin: 0.9, recycled: 0.2 },
    FlyAsh: { virgin: 0.9, recycled: 0.1 },
    TextileWaste: { virgin: 3.2, recycled: 1.1 },
    ElectronicWaste: { virgin: 5.0, recycled: 2.0 },
    Rubber: { virgin: 2.8, recycled: 1.0 },
    Wood: { virgin: 0.5, recycled: 0.1 },
    Slag: { virgin: 1.5, recycled: 0.4 },
    BatteryWaste: { virgin: 6.5, recycled: 2.5 },
    ChemicalSolvent: { virgin: 3.8, recycled: 1.4 }
};

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log("Connected to MongoDB...");
    const formulasArray = Object.entries(emissionFactors).map(([material, factors]) => ({
        material,
        virgin: factors.virgin,
        recycled: factors.recycled
    }));

    try {
        await Formula.deleteMany({});
        await Formula.insertMany(formulasArray);
        console.log("Successfully seeded formulas table!");
    } catch (err) {
        console.error("Error inserting formulas:", err);
    }
    process.exit();
}).catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
});
