import mongoose from "mongoose";

const productionScheduleSchema = new mongoose.Schema({
    factory_id: { type: mongoose.Schema.Types.ObjectId, ref: "Factory", required: true },
    product_type: String,
    production_volume: Number,
    production_month: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.model("ProductionSchedule", productionScheduleSchema);
