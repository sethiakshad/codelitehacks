import mongoose from "mongoose";

const requirementSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    material: { type: String, required: true },
    qty: { type: String, required: true },
    priority: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
    matched: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Requirement", requirementSchema);
