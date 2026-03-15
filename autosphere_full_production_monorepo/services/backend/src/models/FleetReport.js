import mongoose from "mongoose";

const fleetReportSchema = new mongoose.Schema(
  {
    period: { type: String, required: true },
    totalTrips: { type: Number, default: 0 },
    totalDistanceKm: { type: Number, default: 0 },
    totalFuelUsed: { type: Number, default: 0 },
    maintenanceCount: { type: Number, default: 0 },
    alerts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("FleetReport", fleetReportSchema);
