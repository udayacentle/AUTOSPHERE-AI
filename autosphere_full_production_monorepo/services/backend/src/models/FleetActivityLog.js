import mongoose from "mongoose";

const fleetActivityLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true, index: true },
    summary: { type: String, default: "" },
    actorUserId: { type: String, default: "" },
    targetType: { type: String, default: "" },
    targetId: { type: String, default: "" },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "FleetOrganization", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("FleetActivityLog", fleetActivityLogSchema);
