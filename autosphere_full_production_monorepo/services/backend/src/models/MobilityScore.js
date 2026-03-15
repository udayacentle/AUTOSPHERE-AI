import mongoose from "mongoose";

const mobilityScoreSchema = new mongoose.Schema(
  {
    driverId: { type: String, required: true, unique: true },
    overall: { type: Number, default: 0 },
    drivingBehavior: { type: Number, default: 0 },
    vehicleCondition: { type: Number, default: 0 },
    usagePatterns: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("MobilityScore", mobilityScoreSchema);
