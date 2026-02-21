import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    deal_id: { type: mongoose.Schema.Types.ObjectId, ref: "Deal", required: true },
    sender_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);
