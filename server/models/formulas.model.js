import mongoose from "mongoose";

const formulaSchema = new mongoose.Schema({
    material: { type: String, required: true, unique: true },
    virgin: { type: Number, required: true },
    recycled: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model("Formula", formulaSchema);
