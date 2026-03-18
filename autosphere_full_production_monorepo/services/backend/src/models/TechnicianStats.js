import mongoose from "mongoose";

const trendItemSchema = new mongoose.Schema(
  { period: String, score: Number, label: String },
  { _id: false }
);
const periodEarningsSchema = new mongoose.Schema(
  { period: String, label: String, base: Number, incentive: Number, total: Number },
  { _id: false }
);
const jobTypeEarningsSchema = new mongoose.Schema(
  { jobType: String, labourUnits: Number, amount: Number, count: Number },
  { _id: false }
);
const payoutSchema = new mongoose.Schema(
  { date: String, amount: Number, status: String, method: String },
  { _id: false }
);

const technicianStatsSchema = new mongoose.Schema(
  {
    technicianId: { type: String, required: true, unique: true },
    performance: {
      firstTimeFixRate: { type: Number, default: 0 },
      reworkPercent: { type: Number, default: 0 },
      customerRating: { type: Number, default: 0 },
      trends: [trendItemSchema],
      goals: [{ name: String, target: Number, current: Number, unit: String }],
      workshopAverage: { type: Number, default: 0 },
    },
    earnings: {
      byPeriod: [periodEarningsSchema],
      byJobType: [jobTypeEarningsSchema],
      payouts: [payoutSchema],
      nextPayDate: { type: String, default: "" },
      pendingAmount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.model("TechnicianStats", technicianStatsSchema);
