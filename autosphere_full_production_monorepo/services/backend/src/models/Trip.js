import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    driverId: { type: String, default: null, index: true },
    passengerId: { type: String, default: null, index: true },
    date: { type: String, required: true },
    distanceKm: { type: Number, default: 0 },
    durationMin: { type: Number, default: 0 },
    startLocation: { type: String, default: "" },
    endLocation: { type: String, default: "" },
    score: { type: Number, default: 0 },
    status: { type: String, enum: ["pending", "assigned", "in_progress", "completed", "rejected"], default: "pending", index: true },
    vehicleId: { type: String, default: null },
  },
  { timestamps: true }
);

tripSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
tripSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Trip", tripSchema);
