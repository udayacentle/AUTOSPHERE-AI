import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import connectDB from "./db/connectDB.js";
import Profile from "./models/Profile.js";
import Trip from "./models/Trip.js";
import VehicleHealth from "./models/VehicleHealth.js";
import Insurance from "./models/Insurance.js";
import MobilityScore from "./models/MobilityScore.js";
import NextService from "./models/NextService.js";
import FleetVehicle from "./models/FleetVehicle.js";
import FleetDriver from "./models/FleetDriver.js";
import FleetMaintenance from "./models/FleetMaintenance.js";
import FleetReport from "./models/FleetReport.js";

dotenv.config();

connectDB();

const app = express();

app.use(cors({ origin: true }));
app.use(bodyParser.json());

const SECRET = process.env.JWT_SECRET || "AUTOSPHERE_SECRET";
const DEFAULT_DRIVER_ID = "driver1";

const profileStore = new Map();

function getDriverId(req) {
  return req.query.driverId || DEFAULT_DRIVER_ID;
}

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

const emptyDashboard = {
  driver: null,
  vehicle: null,
  mobilityScore: null,
  recentTrips: [],
  nextService: null,
  insurance: null
};

const emptyMobilityScore = {
  overall: 0,
  drivingBehavior: 0,
  vehicleCondition: 0,
  usagePatterns: 0
};

const emptyVehicleHealth = {
  vehicle: null,
  health: {
    engine: 0,
    battery: 0,
    brakesTires: 0,
    fluids: 0,
    electrical: 0
  }
};

const emptyProfile = {
  username: "",
  fullName: "",
  email: "",
  phoneCode: "+91",
  phone: "",
  licenseNumber: "",
  distanceUnits: "km",
  language: "en",
  emailNotifications: true,
  pushNotifications: false
};

// Demo credentials (use env for production): LOGIN_EMAIL, LOGIN_PASSWORD
const DEMO_EMAIL = (process.env.LOGIN_EMAIL || "test@example.com").toLowerCase().trim();
const DEMO_PASSWORD = process.env.LOGIN_PASSWORD || "123456";

app.post("/auth/login", (req, res) => {
  try {
    const { email, usernameOrEmail, password } = req.body || {};
    const identifier = (email || usernameOrEmail || "").toString().trim().toLowerCase();
    const pwd = password != null ? String(password) : "";

    if (!identifier) {
      res.status(400).json({ message: "Email or username is required." });
      return;
    }
    if (identifier !== DEMO_EMAIL || pwd !== DEMO_PASSWORD) {
      res.status(401).json({ message: "Login failed. Please check your credentials and try again." });
      return;
    }
    const token = jwt.sign({ email: identifier }, SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
});

app.get("/vehicles/1", (req, res) => {
  res.json({ mobilityScore: 870 });
});

const sampleTripsForSeed = [
  { driverId: DEFAULT_DRIVER_ID, date: "2025-03-12", distanceKm: 45, durationMin: 62, startLocation: "Downtown", endLocation: "Airport", score: 88 },
  { driverId: DEFAULT_DRIVER_ID, date: "2025-03-11", distanceKm: 23, durationMin: 35, startLocation: "Home", endLocation: "Office", score: 92 },
  { driverId: DEFAULT_DRIVER_ID, date: "2025-03-10", distanceKm: 78, durationMin: 95, startLocation: "City Center", endLocation: "Mall", score: 85 },
  { driverId: DEFAULT_DRIVER_ID, date: "2025-03-09", distanceKm: 12, durationMin: 18, startLocation: "Office", endLocation: "Gym", score: 90 },
  { driverId: DEFAULT_DRIVER_ID, date: "2025-03-08", distanceKm: 56, durationMin: 72, startLocation: "Airport", endLocation: "Downtown", score: 82 },
  { driverId: DEFAULT_DRIVER_ID, date: "2025-03-07", distanceKm: 34, durationMin: 44, startLocation: "Mall", endLocation: "Home", score: 87 },
];

async function ensureDriverSeed() {
  if (!isDbConnected()) return;
  const existing = await Profile.findOne({ driverId: DEFAULT_DRIVER_ID }).lean();
  if (existing) return;
  await Profile.create({
    driverId: DEFAULT_DRIVER_ID,
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
  await Trip.insertMany(sampleTripsForSeed);
  await VehicleHealth.create({
    driverId: DEFAULT_DRIVER_ID,
    vehicle: { id: "v1", make: "Toyota", model: "Camry 2024", healthScore: 87 },
    health: { engine: 90, battery: 85, brakesTires: 88, fluids: 82, electrical: 92 },
  });
  await Insurance.create({
    driverId: DEFAULT_DRIVER_ID,
    provider: "AutoSafe Insurance",
    policyNumber: "POL-2024-45678",
    expiryDate: "2025-09-15",
    premium: 1200,
    coverage: "Comprehensive",
  });
  await MobilityScore.create({
    driverId: DEFAULT_DRIVER_ID,
    overall: 86,
    drivingBehavior: 88,
    vehicleCondition: 87,
    usagePatterns: 83,
    updatedAt: new Date(),
  });
  await NextService.create({
    driverId: DEFAULT_DRIVER_ID,
    date: "2025-04-20",
    type: "Oil Change",
    description: "Scheduled oil change and filter replacement at preferred service center.",
  });
  console.log("Driver: seeded sample data into database.");
}

app.get("/api/dashboard", async (req, res) => {
  const driverId = getDriverId(req);
  if (!isDbConnected()) {
    return res.json(emptyDashboard);
  }
  try {
    await ensureDriverSeed();
    const [profile, trips, vehicleHealth, insurance, mobilityScore, nextService] = await Promise.all([
      Profile.findOne({ driverId }).lean(),
      Trip.find({ driverId }).sort({ date: -1 }).limit(5).lean(),
      VehicleHealth.findOne({ driverId }).lean(),
      Insurance.findOne({ driverId }).lean(),
      MobilityScore.findOne({ driverId }).lean(),
      NextService.findOne({ driverId }).lean()
    ]);

    const driver = profile
      ? { id: driverId, name: profile.fullName || "Driver", email: profile.email || "" }
      : null;

    const vehicle = vehicleHealth?.vehicle
      ? {
          id: vehicleHealth.vehicle.id || "v1",
          make: vehicleHealth.vehicle.make || "",
          model: vehicleHealth.vehicle.model || "",
          healthScore: vehicleHealth.vehicle.healthScore ?? 0,
          nextServiceDate: nextService?.date || ""
        }
      : null;

    const recentTrips = (trips || []).map((t) => ({
      id: t._id?.toString() || t.id,
      date: t.date,
      distanceKm: t.distanceKm,
      durationMin: t.durationMin,
      score: t.score ?? 0
    }));

    const nextServicePayload = nextService
      ? { date: nextService.date, type: nextService.type, description: nextService.description }
      : null;

    const insurancePayload = insurance
      ? {
          provider: insurance.provider,
          policyNumber: insurance.policyNumber,
          expiryDate: insurance.expiryDate
        }
      : null;

    res.json({
      driver,
      vehicle,
      mobilityScore: mobilityScore?.overall ?? null,
      recentTrips,
      nextService: nextServicePayload,
      insurance: insurancePayload
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.json(emptyDashboard);
  }
});

app.get("/api/mobility-score", async (req, res) => {
  const driverId = getDriverId(req);
  if (!isDbConnected()) {
    return res.json(emptyMobilityScore);
  }
  try {
    await ensureDriverSeed();
    const doc = await MobilityScore.findOne({ driverId }).lean();
    if (!doc) return res.json(emptyMobilityScore);
    res.json({
      overall: doc.overall ?? 0,
      drivingBehavior: doc.drivingBehavior ?? 0,
      vehicleCondition: doc.vehicleCondition ?? 0,
      usagePatterns: doc.usagePatterns ?? 0,
      updatedAt: doc.updatedAt
    });
  } catch (err) {
    console.error("Mobility score error:", err);
    res.json(emptyMobilityScore);
  }
});

app.get("/api/trips", async (req, res) => {
  const driverId = getDriverId(req);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  if (!isDbConnected()) {
    return res.json([]);
  }
  try {
    await ensureDriverSeed();
    const trips = await Trip.find({ driverId }).sort({ date: -1 }).limit(limit).lean();
    res.json(
      trips.map((t) => ({
        id: t._id?.toString(),
        date: t.date,
        distanceKm: t.distanceKm,
        durationMin: t.durationMin,
        startLocation: t.startLocation || "",
        endLocation: t.endLocation || "",
        score: t.score ?? 0
      }))
    );
  } catch (err) {
    console.error("Trips error:", err);
    res.json([]);
  }
});

app.get("/api/vehicle-health", async (req, res) => {
  const driverId = getDriverId(req);
  if (!isDbConnected()) {
    return res.json(emptyVehicleHealth);
  }
  try {
    await ensureDriverSeed();
    const doc = await VehicleHealth.findOne({ driverId }).lean();
    if (!doc) return res.json(emptyVehicleHealth);
    res.json({
      vehicle: doc.vehicle ?? null,
      health: doc.health ?? emptyVehicleHealth.health
    });
  } catch (err) {
    console.error("Vehicle health error:", err);
    res.json(emptyVehicleHealth);
  }
});

app.get("/api/insurance", async (req, res) => {
  const driverId = getDriverId(req);
  if (!isDbConnected()) {
    return res.json(null);
  }
  try {
    await ensureDriverSeed();
    const doc = await Insurance.findOne({ driverId }).lean();
    if (!doc) return res.json(null);
    res.json({
      provider: doc.provider,
      policyNumber: doc.policyNumber,
      expiryDate: doc.expiryDate,
      premium: doc.premium ?? 0,
      coverage: doc.coverage || ""
    });
  } catch (err) {
    console.error("Insurance error:", err);
    res.json(null);
  }
});

app.get("/api/drivers", (req, res) => {
  res.json([]);
});

// --- Fleet management ---
const defaultFleetDashboard = { trips: 120, fuel: 80, maintenance: 30 };
const defaultFleetVehicles = [
  { plateNumber: "AB-1234", model: "Ford Transit", status: "active", latitude: 37.77, longitude: -122.41 },
  { plateNumber: "CD-5678", model: "Mercedes Sprinter", status: "active", latitude: 37.78, longitude: -122.42 },
  { plateNumber: "EF-9012", model: "Toyota Hiace", status: "maintenance", latitude: null, longitude: null },
];

const defaultFleetDrivers = [
  { name: "James Wilson", licenseId: "DL-2023-1001", assignedVehiclePlate: "AB-1234", status: "active", contact: "james.w@fleet.com" },
  { name: "Maria Santos", licenseId: "DL-2023-1002", assignedVehiclePlate: "CD-5678", status: "active", contact: "maria.s@fleet.com" },
  { name: "David Chen", licenseId: "DL-2023-1003", assignedVehiclePlate: "", status: "available", contact: "david.c@fleet.com" },
];
const defaultFleetMaintenance = [
  { vehiclePlate: "AB-1234", type: "Oil Change", date: "2025-03-15", description: "Regular oil and filter change", status: "completed", cost: 85 },
  { vehiclePlate: "CD-5678", type: "Tire Rotation", date: "2025-03-20", description: "Rotate tires and balance", status: "scheduled", cost: null },
  { vehiclePlate: "EF-9012", type: "Brake Inspection", date: "2025-03-25", description: "Full brake pad and rotor check", status: "scheduled", cost: null },
];
const defaultFleetReports = [
  { period: "March 2025", totalTrips: 120, totalDistanceKm: 2450, totalFuelUsed: 320, maintenanceCount: 5, alerts: 2 },
  { period: "February 2025", totalTrips: 98, totalDistanceKm: 2100, totalFuelUsed: 280, maintenanceCount: 3, alerts: 0 },
];

async function ensureFleetSeed() {
  if (!isDbConnected()) return;
  const count = await FleetVehicle.countDocuments();
  if (count > 0) return;
  await FleetVehicle.insertMany(defaultFleetVehicles);
  console.log("Fleet: seeded sample vehicles into database.");
}

async function ensureFleetExtendedSeed() {
  if (!isDbConnected()) return;
  const driverCount = await FleetDriver.countDocuments();
  if (driverCount === 0) {
    await FleetDriver.insertMany(defaultFleetDrivers);
    console.log("Fleet: seeded sample drivers into database.");
  }
  const maintenanceCount = await FleetMaintenance.countDocuments();
  if (maintenanceCount === 0) {
    await FleetMaintenance.insertMany(defaultFleetMaintenance);
    console.log("Fleet: seeded sample maintenance into database.");
  }
  const reportCount = await FleetReport.countDocuments();
  if (reportCount === 0) {
    await FleetReport.insertMany(defaultFleetReports);
    console.log("Fleet: seeded sample reports into database.");
  }
}

app.get("/api/fleet/dashboard", async (req, res) => {
  if (!isDbConnected()) return res.json(defaultFleetDashboard);
  try {
    await ensureFleetSeed();
    const count = await FleetVehicle.countDocuments();
    return res.json({ trips: 120, fuel: 80, maintenance: 30, vehicleCount: count });
  } catch (err) {
    console.error("Fleet dashboard error:", err);
    res.json(defaultFleetDashboard);
  }
});

app.get("/api/fleet/vehicles", async (req, res) => {
  if (!isDbConnected()) {
    return res.json(defaultFleetVehicles.map((v, i) => ({ _id: `mock-${i}`, ...v })));
  }
  try {
    await ensureFleetSeed();
    const list = await FleetVehicle.find().lean();
    return res.json(list.map((v) => ({ ...v, id: v._id?.toString() })));
  } catch (err) {
    console.error("Fleet vehicles error:", err);
    res.json(defaultFleetVehicles.map((v, i) => ({ _id: `mock-${i}`, ...v })));
  }
});

app.post("/api/fleet/vehicles", async (req, res) => {
  const { plateNumber, model, status } = req.body || {};
  const payload = {
    plateNumber: plateNumber || "",
    model: model || "",
    status: status || "active",
    latitude: req.body.latitude ?? null,
    longitude: req.body.longitude ?? null,
  };
  if (!isDbConnected()) {
    defaultFleetVehicles.push(payload);
    return res.status(201).json({ _id: `mock-${defaultFleetVehicles.length - 1}`, ...payload });
  }
  try {
    const vehicle = await FleetVehicle.create(payload);
    res.status(201).json(vehicle.toObject ? vehicle.toObject() : vehicle);
  } catch (err) {
    console.error("Fleet vehicle create error:", err);
    res.status(500).json({ message: "Failed to add vehicle." });
  }
});

app.get("/api/fleet/drivers", async (req, res) => {
  if (!isDbConnected()) {
    return res.json(defaultFleetDrivers.map((d, i) => ({ _id: `mock-d-${i}`, ...d })));
  }
  try {
    await ensureFleetExtendedSeed();
    const list = await FleetDriver.find().lean();
    return res.json(list.map((d) => ({ ...d, id: d._id?.toString() })));
  } catch (err) {
    console.error("Fleet drivers error:", err);
    res.json(defaultFleetDrivers.map((d, i) => ({ _id: `mock-d-${i}`, ...d })));
  }
});

app.get("/api/fleet/maintenance", async (req, res) => {
  if (!isDbConnected()) {
    return res.json(defaultFleetMaintenance.map((m, i) => ({ _id: `mock-m-${i}`, ...m })));
  }
  try {
    await ensureFleetExtendedSeed();
    const list = await FleetMaintenance.find().sort({ date: -1 }).lean();
    return res.json(list.map((m) => ({ ...m, id: m._id?.toString() })));
  } catch (err) {
    console.error("Fleet maintenance error:", err);
    res.json(defaultFleetMaintenance.map((m, i) => ({ _id: `mock-m-${i}`, ...m })));
  }
});

app.get("/api/fleet/reports", async (req, res) => {
  if (!isDbConnected()) {
    return res.json(defaultFleetReports.map((r, i) => ({ _id: `mock-r-${i}`, ...r })));
  }
  try {
    await ensureFleetExtendedSeed();
    const list = await FleetReport.find().sort({ period: -1 }).lean();
    return res.json(list.map((r) => ({ ...r, id: r._id?.toString() })));
  } catch (err) {
    console.error("Fleet reports error:", err);
    res.json(defaultFleetReports.map((r, i) => ({ _id: `mock-r-${i}`, ...r })));
  }
});

app.get("/api/profile", async (req, res) => {
  const driverId = getDriverId(req);
  if (!isDbConnected()) {
    const saved = profileStore.get(driverId);
    const profile = saved ? { ...emptyProfile, ...saved } : emptyProfile;
    return res.json(profile);
  }
  try {
    await ensureDriverSeed();
    const doc = await Profile.findOne({ driverId }).lean();
    if (!doc) return res.json(emptyProfile);
    res.json({
      username: doc.username ?? "",
      fullName: doc.fullName ?? "",
      email: doc.email ?? "",
      phoneCode: doc.phoneCode ?? "+91",
      phone: doc.phone ?? "",
      licenseNumber: doc.licenseNumber ?? "",
      distanceUnits: doc.distanceUnits ?? "km",
      language: doc.language ?? "en",
      emailNotifications: doc.emailNotifications !== false,
      pushNotifications: doc.pushNotifications === true
    });
  } catch (err) {
    console.error("Profile get error:", err);
    res.json(emptyProfile);
  }
});

app.put("/api/profile", async (req, res) => {
  const driverId = getDriverId(req);
  const {
    username,
    fullName,
    email,
    phoneCode,
    phone,
    licenseNumber,
    distanceUnits,
    language,
    emailNotifications,
    pushNotifications
  } = req.body;

  const payload = {
    username: username ?? "",
    fullName: fullName ?? "",
    email: email ?? "",
    phoneCode: phoneCode ?? "+91",
    phone: phone ?? "",
    licenseNumber: licenseNumber ?? "",
    distanceUnits: distanceUnits ?? "km",
    language: language ?? "en",
    emailNotifications: emailNotifications !== false,
    pushNotifications: pushNotifications === true
  };

  if (!isDbConnected()) {
    profileStore.set(driverId, payload);
    return res.json({ success: true });
  }
  try {
    await Profile.findOneAndUpdate(
      { driverId },
      { $set: payload },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Profile put error:", err);
    res.status(500).json({ success: false, message: "Failed to save profile." });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("AutoSphere Backend running on port " + PORT);
});
