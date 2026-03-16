import mongoose from "mongoose";

const fleetRoleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true, sparse: true },
    description: { type: String, default: "" },
    permissions: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model("FleetRole", fleetRoleSchema);
