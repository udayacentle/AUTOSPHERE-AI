import mongoose from "mongoose";

const faultItemSchema = new mongoose.Schema(
  { fault: String, cause: String, confidence: Number, evidence: String },
  { _id: false }
);
const similarCaseSchema = new mongoose.Schema(
  { caseId: String, vehiclePlate: String, summary: String, outcome: String },
  { _id: false }
);
const procedureStepSchema = new mongoose.Schema(
  { order: Number, name: String, description: String, durationMin: Number },
  { _id: false }
);
const partItemSchema = new mongoose.Schema(
  { partNumber: String, name: String, quantity: Number, inStock: Boolean, unitPrice: Number },
  { _id: false }
);
const workflowStageSchema = new mongoose.Schema(
  { id: String, name: String, status: String, estimatedMin: Number, actualMin: Number, startedAt: Date, completedAt: Date },
  { _id: false }
);
const arStepSchema = new mongoose.Schema(
  { order: Number, title: String, instruction: String, highlightComponent: String },
  { _id: false }
);

const technicianJobExtraSchema = new mongoose.Schema(
  {
    jobId: { type: String, required: true, unique: true },
    vehiclePlate: { type: String, default: "" },
    jobType: { type: String, default: "" },
    faultDetection: {
      faults: [faultItemSchema],
      rootCause: { primary: String, contributing: [String] },
      similarCases: [similarCaseSchema],
    },
    repairRecommendations: {
      steps: [procedureStepSchema],
      parts: [partItemSchema],
      labourMinutes: { type: Number, default: 0 },
      manualLinks: [{ title: String, url: String }],
    },
    partsPrediction: {
      predicted: [partItemSchema],
      stock: [{ partNumber: String, name: String, quantity: Number, location: String }],
      alternatives: [{ partNumber: String, name: String, oemPartNumber: String, aftermarket: Boolean }],
    },
    workflow: {
      stages: [workflowStageSchema],
    },
    timeEstimate: {
      estimatedMinutes: { type: Number, default: 0 },
      actualMinutes: { type: Number, default: null },
      eta: { type: Date, default: null },
      startedAt: { type: Date, default: null },
    },
    arSteps: [arStepSchema],
  },
  { timestamps: true }
);

technicianJobExtraSchema.index({ vehiclePlate: 1 });

export default mongoose.model("TechnicianJobExtra", technicianJobExtraSchema);
