import mongoose from "mongoose";

const diagnosticCodeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    type: { type: String, default: "OBD2" },
    description: { type: String, default: "" },
    severity: { type: String, enum: ["critical", "warning", "info"], default: "warning" },
    status: { type: String, enum: ["active", "pending", "cleared"], default: "active" },
    firstSeenAt: { type: Date, default: Date.now },
    relatedRepairId: { type: String, default: null },
  },
  { _id: false }
);

const sensorReadingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    unit: { type: String, default: "" },
    status: { type: String, enum: ["normal", "warning", "critical"], default: "normal" },
    readAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const serviceRecordSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    type: { type: String, default: "" },
    description: { type: String, default: "" },
    mileageKm: { type: Number, default: null },
    partsReplaced: [{ type: String }],
    cost: { type: Number, default: null },
    provider: { type: String, default: "" },
  },
  { _id: false }
);

const vehicleDiagnosticTwinSchema = new mongoose.Schema(
  {
    vehicleId: { type: String, default: "" },
    vin: { type: String, default: "" },
    plateNumber: { type: String, required: true },
    make: { type: String, default: "" },
    model: { type: String, default: "" },
    year: { type: Number, default: null },
    odometerKm: { type: Number, default: 0 },
    healthScore: { type: Number, default: 0 },
    health: {
      engine: { type: Number, default: 0 },
      battery: { type: Number, default: 0 },
      brakesTires: { type: Number, default: 0 },
      fluids: { type: Number, default: 0 },
      electrical: { type: Number, default: 0 },
    },
    diagnosticCodes: [diagnosticCodeSchema],
    sensorData: [sensorReadingSchema],
    serviceHistory: [serviceRecordSchema],
    lastScanAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

vehicleDiagnosticTwinSchema.index({ plateNumber: 1 }, { unique: true });
vehicleDiagnosticTwinSchema.index({ vin: 1 });
vehicleDiagnosticTwinSchema.index({ vehicleId: 1 });

export default mongoose.model("VehicleDiagnosticTwin", vehicleDiagnosticTwinSchema);
