import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: "factory_manager" },

  factory_id: { type: mongoose.Schema.Types.ObjectId, ref: "Factory" }

}, { timestamps: true });

export default mongoose.model("User", userSchema);