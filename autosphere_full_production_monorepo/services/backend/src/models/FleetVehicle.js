import mongoose from "mongoose";

const fleetVehicleSchema = new mongoose.Schema(
  {
    plateNumber: { type: String, required: true },
    model: { type: String, default: "" },
    status: { type: String, default: "active" },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("FleetVehicle", fleetVehicleSchema);
