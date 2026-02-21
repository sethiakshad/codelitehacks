import mongoose from "mongoose";

const wasteRatioSchema = new mongoose.Schema({
  product_type: String,
  waste_type: String,
  waste_ratio: Number,
});

export default mongoose.model("WasteRatio", wasteRatioSchema);