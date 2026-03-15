import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    driverId: { type: String, required: true, unique: true },
    username: { type: String, default: "" },
    fullName: { type: String, default: "" },
    email: { type: String, default: "" },
    phoneCode: { type: String, default: "+91" },
    phone: { type: String, default: "" },
    licenseNumber: { type: String, default: "" },
    distanceUnits: { type: String, default: "km" },
    language: { type: String, default: "en" },
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Profile", profileSchema);
