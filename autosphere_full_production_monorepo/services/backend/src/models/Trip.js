import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    driverId: { type: String, required: true, index: true },
    date: { type: String, required: true },
    distanceKm: { type: Number, required: true },
    durationMin: { type: Number, required: true },
    startLocation: { type: String, default: "" },
    endLocation: { type: String, default: "" },
    score: { type: Number, default: 0 },
  },
  { timestamps: true }
);

tripSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
tripSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Trip", tripSchema);
