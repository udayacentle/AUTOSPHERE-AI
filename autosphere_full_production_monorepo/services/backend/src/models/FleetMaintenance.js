import mongoose from "mongoose";

const fleetMaintenanceSchema = new mongoose.Schema(
  {
    vehiclePlate: { type: String, required: true },
    type: { type: String, default: "" },
    date: { type: String, required: true },
    description: { type: String, default: "" },
    status: { type: String, default: "scheduled" },
    cost: { type: Number, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("FleetMaintenance", fleetMaintenanceSchema);
