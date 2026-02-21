import mongoose from "mongoose";

const dealSchema = new mongoose.Schema({
    buyer_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seller_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    listing_id: { type: mongoose.Schema.Types.ObjectId, ref: "FactoryWasteProfile", required: true },
    quantity: { type: Number, required: true },
    co2_saved: { type: Number, required: true },
    landfill_diverted: { type: Number, required: true },
    status: { type: String, enum: ["Pending", "Completed", "Cancelled"], default: "Pending" }
}, { timestamps: true });

export default mongoose.model("Deal", dealSchema);
