import mongoose from "mongoose";

const fleetAlertSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    severity: { type: String, default: "medium" },
    vehiclePlate: { type: String, default: "" },
    driverId: { type: String, default: "" },
    message: { type: String, required: true },
    status: { type: String, default: "open" },
    source: { type: String, default: "system" },
    createdAtIso: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

export default mongoose.model("FleetAlert", fleetAlertSchema);
