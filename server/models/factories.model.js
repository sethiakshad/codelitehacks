import mongoose from "mongoose";

const factorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  industry_type: { type: String, required: true },
  registration_number: { type: String, unique: true },

  contact_person: String,
  email: { type: String, unique: true },
  phone: String,

  address: String,
  city: String,
  state: String,
  country: { type: String, default: "India" },
  latitude: Number,
  longitude: Number,

  annual_production_capacity: Number,
  number_of_employees: Number,

  esg_rating: Number,
  circularity_score: { type: Number, default: 0 },

  hazardous_waste_license: { type: Boolean, default: false },
  iso_certified: { type: Boolean, default: false },

  is_verified: { type: Boolean, default: false },
  is_active: { type: Boolean, default: true },

}, { timestamps: true });

export default mongoose.model("Factory", factorySchema);