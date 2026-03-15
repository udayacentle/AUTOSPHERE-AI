import mongoose from "mongoose";

const insuranceSchema = new mongoose.Schema(
  {
    driverId: { type: String, required: true, unique: true },
    provider: { type: String, default: "" },
    policyNumber: { type: String, default: "" },
    expiryDate: { type: String, default: "" },
    premium: { type: Number, default: 0 },
    coverage: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Insurance", insuranceSchema);
