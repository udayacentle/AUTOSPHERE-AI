import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("ℹ️  No MONGODB_URI set — running without database (mock data only).");
    return;
  }
  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    console.log("ℹ️  Server will run with in-memory mock data. Set MONGODB_URI to connect.");
  }
};

export default connectDB;