import mongoose from "mongoose";

const fleetOrganizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true, sparse: true },
    contactEmail: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    address: { type: String, default: "" },
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model("FleetOrganization", fleetOrganizationSchema);
