import mongoose from "mongoose";

const fleetDriverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    licenseId: { type: String, default: "" },
    assignedVehiclePlate: { type: String, default: "" },
    status: { type: String, default: "active" },
    contact: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("FleetDriver", fleetDriverSchema);
