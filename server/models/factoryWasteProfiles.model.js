import mongoose from "mongoose";

const wasteProfileSchema = new mongoose.Schema({
  factory_id: { type: mongoose.Schema.Types.ObjectId, ref: "Factory" },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  waste_type: { type: String, required: true },
  average_quantity_per_month: Number,
  hazardous: { type: Boolean, default: false },
  storage_condition: String,
  embedding: { type: [Number] },

}, { timestamps: true });

export default mongoose.model("FactoryWasteProfile", wasteProfileSchema);