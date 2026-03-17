import mongoose from "mongoose";

const insuranceClaimSchema = new mongoose.Schema(
  {
    claimId: { type: String, required: true, unique: true },
    driverId: { type: String, required: true, index: true },
    date: { type: String, default: "" },
    amount: { type: Number, default: 0 },
    status: { type: String, default: "submitted" },
    description: { type: String, default: "" },
    assessmentId: { type: String, default: "" },
    damageType: { type: String, default: "General" },
    affectedParts: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model("InsuranceClaim", insuranceClaimSchema);
