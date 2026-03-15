import mongoose from "mongoose";

const nextServiceSchema = new mongoose.Schema(
  {
    driverId: { type: String, required: true, unique: true },
    date: { type: String, default: "" },
    type: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("NextService", nextServiceSchema);
