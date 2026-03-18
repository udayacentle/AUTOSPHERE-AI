import mongoose from "mongoose";

const fleetUserSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    email: { type: String, default: "" },
    fullName: { type: String, default: "" },
    roleSlug: { type: String, required: true, index: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "FleetOrganization", default: null },
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

fleetUserSchema.index({ organizationId: 1, roleSlug: 1 });

export default mongoose.model("FleetUser", fleetUserSchema);
