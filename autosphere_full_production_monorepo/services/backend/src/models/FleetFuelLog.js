import mongoose from "mongoose";

const fleetFuelLogSchema = new mongoose.Schema(
  {
    vehiclePlate: { type: String, required: true },
    date: { type: String, required: true },
    liters: { type: Number, required: true },
    pricePerLiter: { type: Number, default: 0 },
    totalCost: { type: Number, required: true },
    odometerKm: { type: Number, default: 0 },
    fuelType: { type: String, default: "diesel" },
    station: { type: String, default: "" },
    recordedBy: { type: String, default: "system" },
  },
  { timestamps: true }
);

export default mongoose.model("FleetFuelLog", fleetFuelLogSchema);
