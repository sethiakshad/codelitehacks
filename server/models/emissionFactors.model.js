import mongoose from "mongoose";

const emissionFactorSchema = new mongoose.Schema({
  waste_type: String,
  co2_saved_per_ton: Number,
  landfill_diversion_factor: Number,
}, { timestamps: true });

export default mongoose.model("EmissionFactor", emissionFactorSchema);