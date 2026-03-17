import mongoose from "mongoose";
import dotenv from "dotenv";
import Profile from "../models/Profile.js";
import Trip from "../models/Trip.js";
import VehicleHealth from "../models/VehicleHealth.js";
import Insurance from "../models/Insurance.js";
import InsuranceClaim from "../models/InsuranceClaim.js";
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

// Insurance dashboard: extra drivers and policies for portfolio / risk views
const insuranceProfiles = [
  { driverId: "driver1", username: "demo_driver", fullName: "Alex Rivera", email: "alex.rivera@example.com", phoneCode: "+1", phone: "5551234567", licenseNumber: "DL-2024-7890", distanceUnits: "km", language: "en", emailNotifications: true, pushNotifications: true },
  { driverId: "driver2", username: "jordan_lee", fullName: "Jordan Lee", email: "jordan.lee@example.com", phoneCode: "+1", phone: "5552345678", licenseNumber: "DL-2024-7891", distanceUnits: "km", language: "en", emailNotifications: true, pushNotifications: false },
  { driverId: "driver3", username: "sam_chen", fullName: "Sam Chen", email: "sam.chen@example.com", phoneCode: "+1", phone: "5553456789", licenseNumber: "DL-2024-7892", distanceUnits: "km", language: "en", emailNotifications: true, pushNotifications: true },
  { driverId: "driver4", username: "morgan_taylor", fullName: "Morgan Taylor", email: "morgan.t@example.com", phoneCode: "+1", phone: "5554567890", licenseNumber: "DL-2024-7893", distanceUnits: "km", language: "en", emailNotifications: false, pushNotifications: true },
  { driverId: "driver5", username: "casey_kim", fullName: "Casey Kim", email: "casey.kim@example.com", phoneCode: "+1", phone: "5555678901", licenseNumber: "DL-2024-7894", distanceUnits: "km", language: "en", emailNotifications: true, pushNotifications: true },
];

const insurancePolicies = [
  { driverId: "driver1", provider: "State Farm", policyNumber: "POL-2024-45678", expiryDate: "2025-09-15", premium: 1240, coverage: "Comprehensive" },
  { driverId: "driver2", provider: "Geico", policyNumber: "POL-2024-45679", expiryDate: "2025-11-20", premium: 980, coverage: "Liability Plus" },
  { driverId: "driver3", provider: "Progressive", policyNumber: "POL-2024-45680", expiryDate: "2025-07-01", premium: 1520, coverage: "Comprehensive" },
  { driverId: "driver4", provider: "Allstate", policyNumber: "POL-2024-45681", expiryDate: "2026-01-10", premium: 1100, coverage: "Standard" },
  { driverId: "driver5", provider: "Liberty Mutual", policyNumber: "POL-2024-45682", expiryDate: "2025-08-22", premium: 1350, coverage: "Comprehensive" },
];

const insuranceMobilityScores = [
  { driverId: "driver1", overall: 86, drivingBehavior: 88, vehicleCondition: 87, usagePatterns: 83, updatedAt: new Date() },
  { driverId: "driver2", overall: 78, drivingBehavior: 75, vehicleCondition: 82, usagePatterns: 76, updatedAt: new Date() },
  { driverId: "driver3", overall: 72, drivingBehavior: 70, vehicleCondition: 75, usagePatterns: 71, updatedAt: new Date() },
  { driverId: "driver4", overall: 91, drivingBehavior: 92, vehicleCondition: 90, usagePatterns: 90, updatedAt: new Date() },
  { driverId: "driver5", overall: 65, drivingBehavior: 62, vehicleCondition: 68, usagePatterns: 65, updatedAt: new Date() },
];

const insuranceClaimsSeed = [
  { claimId: "CLM-001", driverId: "driver1", date: "2025-03-10", amount: 1200, status: "assessing", description: "Rear bumper damage", damageType: "Rear damage", affectedParts: ["Rear bumper", "Paint"] },
  { claimId: "CLM-002", driverId: "driver1", date: "2025-02-28", amount: 420, status: "paid", description: "Windshield chip repair", damageType: "Windshield / glass", affectedParts: ["Windshield"] },
  { claimId: "CLM-003", driverId: "driver2", date: "2025-03-05", amount: 0, status: "submitted", description: "Minor door dent", damageType: "Side damage", affectedParts: ["Door panel"] },
  { claimId: "CLM-004", driverId: "driver3", date: "2025-02-15", amount: 1850, status: "approved", description: "Front collision", damageType: "Front damage", affectedParts: ["Front bumper", "Grille", "Hood"] },
  { claimId: "CLM-005", driverId: "driver3", date: "2025-01-20", amount: 0, status: "rejected", description: "Scratch claim", damageType: "Body damage", affectedParts: ["Paint"] },
  { claimId: "CLM-006", driverId: "driver4", date: "2025-03-12", amount: 650, status: "assessing", description: "Hail damage", damageType: "Body damage", affectedParts: ["Roof", "Hood", "Paint"] },
  { claimId: "CLM-007", driverId: "driver5", date: "2025-02-01", amount: 2100, status: "paid", description: "Multi-panel accident", damageType: "Multi-panel damage", affectedParts: ["Rear bumper", "Front bumper", "Paint"] },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set. Cannot seed.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  await Profile.deleteMany({ driverId: { $in: ["driver1", "driver2", "driver3", "driver4", "driver5"] } }).catch(() => {});
  await Profile.insertMany(insuranceProfiles);
  console.log("Seeded Profiles (insurance drivers)");

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

  await Insurance.deleteMany({}).catch(() => {});
  await Insurance.insertMany(insurancePolicies);
  console.log("Seeded Insurance (policies for all drivers)");

  await MobilityScore.deleteMany({ driverId: { $in: ["driver1", "driver2", "driver3", "driver4", "driver5"] } }).catch(() => {});
  await MobilityScore.insertMany(insuranceMobilityScores);
  console.log("Seeded MobilityScore (all drivers)");

  await InsuranceClaim.deleteMany({}).catch(() => {});
  await InsuranceClaim.insertMany(insuranceClaimsSeed);
  console.log("Seeded InsuranceClaim (claims for insurance dashboard)");

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
