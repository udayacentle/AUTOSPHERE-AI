import mongoose from "mongoose";
import dotenv from "dotenv";
import Profile from "../models/Profile.js";
import Trip from "../models/Trip.js";
import VehicleHealth from "../models/VehicleHealth.js";
import Insurance from "../models/Insurance.js";
import MobilityScore from "../models/MobilityScore.js";
import NextService from "../models/NextService.js";
import FleetVehicle from "../models/FleetVehicle.js";
import FleetDriver from "../models/FleetDriver.js";
import FleetMaintenance from "../models/FleetMaintenance.js";
import FleetReport from "../models/FleetReport.js";

dotenv.config();

const DRIVER_ID = "driver1";

const sampleTrips = [
  { driverId: DRIVER_ID, date: "2025-03-12", distanceKm: 45, durationMin: 62, startLocation: "San Francisco, CA", endLocation: "SFO Airport", score: 88 },
  { driverId: DRIVER_ID, date: "2025-03-11", distanceKm: 23, durationMin: 35, startLocation: "Oakland", endLocation: "Downtown SF", score: 92 },
  { driverId: DRIVER_ID, date: "2025-03-10", distanceKm: 78, durationMin: 95, startLocation: "San Jose", endLocation: "Palo Alto", score: 85 },
  { driverId: DRIVER_ID, date: "2025-03-09", distanceKm: 12, durationMin: 18, startLocation: "Mission District", endLocation: "SOMA", score: 90 },
  { driverId: DRIVER_ID, date: "2025-03-08", distanceKm: 56, durationMin: 72, startLocation: "SFO Airport", endLocation: "Berkeley", score: 82 },
  { driverId: DRIVER_ID, date: "2025-03-07", distanceKm: 34, durationMin: 44, startLocation: "Sunnyvale", endLocation: "Mountain View", score: 87 },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set. Cannot seed.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  await Profile.deleteOne({ driverId: DRIVER_ID }).catch(() => {});
  await Profile.create({
    driverId: DRIVER_ID,
    username: "demo_driver",
    fullName: "Alex Rivera",
    email: "test@example.com",
    phoneCode: "+1",
    phone: "5551234567",
    licenseNumber: "DL-2024-7890",
    distanceUnits: "km",
    language: "en",
    emailNotifications: true,
    pushNotifications: true,
  });
  console.log("Seeded Profile");

  await Trip.deleteMany({ driverId: DRIVER_ID }).catch(() => {});
  await Trip.insertMany(sampleTrips);
  console.log("Seeded Trips");

  await VehicleHealth.deleteOne({ driverId: DRIVER_ID }).catch(() => {});
  await VehicleHealth.create({
    driverId: DRIVER_ID,
    vehicle: { id: "v1", make: "Toyota", model: "Camry 2024", healthScore: 87 },
    health: { engine: 90, battery: 85, brakesTires: 88, fluids: 82, electrical: 92 },
  });
  console.log("Seeded VehicleHealth");

  await Insurance.deleteOne({ driverId: DRIVER_ID }).catch(() => {});
  await Insurance.create({
    driverId: DRIVER_ID,
    provider: "State Farm",
    policyNumber: "POL-2024-45678",
    expiryDate: "2025-09-15",
    premium: 1240,
    coverage: "Comprehensive",
  });
  console.log("Seeded Insurance");

  await MobilityScore.deleteOne({ driverId: DRIVER_ID }).catch(() => {});
  await MobilityScore.create({
    driverId: DRIVER_ID,
    overall: 86,
    drivingBehavior: 88,
    vehicleCondition: 87,
    usagePatterns: 83,
    updatedAt: new Date(),
  });
  console.log("Seeded MobilityScore");

  await NextService.deleteOne({ driverId: DRIVER_ID }).catch(() => {});
  await NextService.create({
    driverId: DRIVER_ID,
    date: "2025-04-20",
    type: "Oil Change",
    description: "Scheduled oil change and filter replacement at preferred service center.",
  });
  console.log("Seeded NextService");

  await FleetVehicle.deleteMany({}).catch(() => {});
  await FleetVehicle.insertMany([
    { plateNumber: "AB-1234", model: "Ford Transit", status: "active", latitude: 37.7749, longitude: -122.4194 },
    { plateNumber: "CD-5678", model: "Mercedes Sprinter", status: "active", latitude: 37.7849, longitude: -122.4094 },
    { plateNumber: "EF-9012", model: "Toyota Hiace", status: "maintenance", latitude: null, longitude: null },
  ]);
  console.log("Seeded Fleet vehicles");

  await FleetDriver.deleteMany({}).catch(() => {});
  await FleetDriver.insertMany([
    { name: "James Wilson", licenseId: "DL-2023-1001", assignedVehiclePlate: "AB-1234", status: "active", contact: "james.w@fleet.com" },
    { name: "Maria Santos", licenseId: "DL-2023-1002", assignedVehiclePlate: "CD-5678", status: "active", contact: "maria.s@fleet.com" },
    { name: "David Chen", licenseId: "DL-2023-1003", assignedVehiclePlate: "", status: "available", contact: "david.c@fleet.com" },
  ]);
  console.log("Seeded Fleet drivers");

  await FleetMaintenance.deleteMany({}).catch(() => {});
  await FleetMaintenance.insertMany([
    { vehiclePlate: "AB-1234", type: "Oil Change", date: "2025-03-15", description: "Regular oil and filter change", status: "completed", cost: 85 },
    { vehiclePlate: "CD-5678", type: "Tire Rotation", date: "2025-03-20", description: "Rotate tires and balance", status: "scheduled", cost: null },
    { vehiclePlate: "EF-9012", type: "Brake Inspection", date: "2025-03-25", description: "Full brake pad and rotor check", status: "scheduled", cost: null },
  ]);
  console.log("Seeded Fleet maintenance");

  await FleetReport.deleteMany({}).catch(() => {});
  await FleetReport.insertMany([
    { period: "March 2025", totalTrips: 120, totalDistanceKm: 2450, totalFuelUsed: 320, maintenanceCount: 5, alerts: 2 },
    { period: "February 2025", totalTrips: 98, totalDistanceKm: 2100, totalFuelUsed: 280, maintenanceCount: 3, alerts: 0 },
  ]);
  console.log("Seeded Fleet reports");

  await mongoose.disconnect();
  console.log("Seed complete. Disconnected.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
