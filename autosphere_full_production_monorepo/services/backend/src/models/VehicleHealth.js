import mongoose from "mongoose";

const vehicleHealthSchema = new mongoose.Schema(
  {
    driverId: { type: String, required: true, unique: true },
    vehicle: {
      id: { type: String, default: "" },
      make: { type: String, default: "" },
      model: { type: String, default: "" },
      healthScore: { type: Number, default: 0 },
    },
    health: {
      engine: { type: Number, default: 0 },
      battery: { type: Number, default: 0 },
      brakesTires: { type: Number, default: 0 },
      fluids: { type: Number, default: 0 },
      electrical: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.model("VehicleHealth", vehicleHealthSchema);
