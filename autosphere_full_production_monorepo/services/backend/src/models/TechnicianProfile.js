import mongoose from "mongoose";

const technicianProfileSchema = new mongoose.Schema(
  {
    technicianId: { type: String, required: true, unique: true },
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    workshop: { type: String, default: "" },
    bay: { type: String, default: "" },
    role: { type: String, default: "Technician" },
  },
  { timestamps: true }
);

export default mongoose.model("TechnicianProfile", technicianProfileSchema);
