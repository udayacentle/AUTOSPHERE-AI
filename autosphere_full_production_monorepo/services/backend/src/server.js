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
import FleetOrganization from "./models/FleetOrganization.js";
import FleetRole from "./models/FleetRole.js";
import { getWeather, getRecalls, REAL_SERVICE_CENTERS, EMISSION_FACTORS } from "./services/realWorldApis.js";

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

// Sample dashboard when DB is disconnected so driver home subsection shows usable data
const sampleDriverDashboard = {
  driver: { id: "driver1", name: "Alex Rivera", email: "test@example.com" },
  vehicle: { id: "v1", make: "Toyota", model: "Camry 2024", healthScore: 87 },
  mobilityScore: 86,
  recentTrips: [
    { id: "t1", date: "2025-03-12", distanceKm: 45, durationMin: 62, score: 88 },
    { id: "t2", date: "2025-03-11", distanceKm: 23, durationMin: 35, score: 92 },
    { id: "t3", date: "2025-03-10", distanceKm: 78, durationMin: 95, score: 85 },
  ],
  nextService: { date: "2025-04-20", type: "Oil Change", description: "Scheduled oil change and filter replacement." },
  insurance: { provider: "State Farm", policyNumber: "POL-2024-45678", expiryDate: "2025-09-15" },
};

const emptyMobilityScore = {
  overall: 0,
  drivingBehavior: 0,
  vehicleCondition: 0,
  usagePatterns: 0
};

const sampleMobilityScore = {
  overall: 86,
  drivingBehavior: 88,
  vehicleCondition: 87,
  usagePatterns: 83,
  updatedAt: new Date().toISOString(),
  trend: "up",
  previousOverall: 82,
  recommendations: [
    "Keep smooth braking; you improved 3 pts this month.",
    "Vehicle condition is good; schedule oil change by Apr 20 to maintain score.",
    "Try to avoid short trips under 5 km when possible to improve usage efficiency.",
  ],
  breakdown: [
    { label: "Speed compliance", score: 90, weight: "25%" },
    { label: "Braking smoothness", score: 85, weight: "25%" },
    { label: "Cornering & lane discipline", score: 88, weight: "25%" },
    { label: "Trip consistency", score: 82, weight: "25%" },
  ],
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

const sampleVehicleHealth = {
  vehicle: { id: "v1", make: "Toyota", model: "Camry 2024", healthScore: 87 },
  health: { engine: 90, battery: 85, brakesTires: 88, fluids: 82, electrical: 92 },
};

function getHealthStatus(score) {
  if (score >= 85) return "good";
  if (score >= 65) return "fair";
  return "attention";
}

function buildVehicleHealthResponse(doc) {
  const vehicle = doc?.vehicle ?? sampleVehicleHealth.vehicle;
  const health = doc?.health ?? sampleVehicleHealth.health;
  const components = [
    { key: "engine", score: health.engine ?? 0, label: "Engine", sublabel: "Oil, filters, performance" },
    { key: "battery", score: health.battery ?? 0, label: "Battery", sublabel: "Charge, age, SOH" },
    { key: "brakesTires", score: health.brakesTires ?? 0, label: "Brakes & tires", sublabel: "Wear, pressure" },
    { key: "fluids", score: health.fluids ?? 0, label: "Fluids", sublabel: "Oil, coolant, brake fluid" },
    { key: "electrical", score: health.electrical ?? 0, label: "Electrical", sublabel: "Lights, sensors" },
  ];
  const componentDetails = components.map((c) => ({
    key: c.key,
    score: c.score,
    status: getHealthStatus(c.score),
    message:
      c.score >= 85 ? "No action needed" : c.score >= 65 ? "Consider inspection at next service" : "Schedule service soon",
    label: c.label,
    sublabel: c.sublabel,
  }));
  const recommendations = [];
  if ((health.fluids ?? 0) < 85) recommendations.push("Top up or replace fluids at next service.");
  if ((health.brakesTires ?? 0) < 80) recommendations.push("Have brakes and tire tread checked.");
  if ((health.battery ?? 0) < 75) recommendations.push("Battery may need testing or replacement soon.");
  if ((health.engine ?? 0) < 80) recommendations.push("Engine diagnostics recommended.");
  if (recommendations.length === 0) recommendations.push("All systems within normal range. Keep up regular maintenance.");
  const alerts = componentDetails.filter((c) => c.status === "attention").map((c) => ({ id: c.key, component: c.label, score: c.score }));
  const overallScore = vehicle?.healthScore ?? Math.round(components.reduce((a, c) => a + c.score, 0) / components.length);
  return {
    vehicle: vehicle ? { ...vehicle, healthScore: overallScore } : null,
    health,
    lastUpdated: doc?.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
    componentDetails,
    recommendations,
    alerts,
  };
}

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

// Real-world seed data: cities (US/India), real car models, real insurance brands
const sampleTripsForSeed = [
  { driverId: DEFAULT_DRIVER_ID, date: "2025-03-12", distanceKm: 45, durationMin: 62, startLocation: "San Francisco, CA", endLocation: "SFO Airport", score: 88 },
  { driverId: DEFAULT_DRIVER_ID, date: "2025-03-11", distanceKm: 23, durationMin: 35, startLocation: "Oakland", endLocation: "Downtown SF", score: 92 },
  { driverId: DEFAULT_DRIVER_ID, date: "2025-03-10", distanceKm: 78, durationMin: 95, startLocation: "San Jose", endLocation: "Palo Alto", score: 85 },
  { driverId: DEFAULT_DRIVER_ID, date: "2025-03-09", distanceKm: 12, durationMin: 18, startLocation: "Mission District", endLocation: "SOMA", score: 90 },
  { driverId: DEFAULT_DRIVER_ID, date: "2025-03-08", distanceKm: 56, durationMin: 72, startLocation: "SFO Airport", endLocation: "Berkeley", score: 82 },
  { driverId: DEFAULT_DRIVER_ID, date: "2025-03-07", distanceKm: 34, durationMin: 44, startLocation: "Sunnyvale", endLocation: "Mountain View", score: 87 },
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
    provider: "State Farm",
    policyNumber: "POL-2024-45678",
    expiryDate: "2025-09-15",
    premium: 1240,
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
    return res.json(sampleDriverDashboard);
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
    res.json(sampleDriverDashboard);
  }
});

app.get("/api/mobility-score", async (req, res) => {
  const driverId = getDriverId(req);
  if (!isDbConnected()) {
    return res.json(sampleMobilityScore);
  }
  try {
    await ensureDriverSeed();
    const doc = await MobilityScore.findOne({ driverId }).lean();
    if (!doc) return res.json(sampleMobilityScore);
    const overall = doc.overall ?? 0;
    const previous = Math.max(0, overall - 4);
    const trend = overall >= (doc.previousOverall ?? previous) ? "up" : overall === (doc.previousOverall ?? previous) ? "stable" : "down";
    const recommendations = [];
    if ((doc.drivingBehavior ?? 0) < 85) recommendations.push("Smooth braking and steady speed improve your driving behavior score.");
    if ((doc.vehicleCondition ?? 0) < 80) recommendations.push("Schedule a vehicle check to improve the vehicle condition score.");
    if ((doc.usagePatterns ?? 0) < 80) recommendations.push("Fewer very short trips and consistent routes help usage patterns.");
    if (recommendations.length === 0) recommendations.push("Keep up the good work. Your mobility score is on track.");
    res.json({
      overall,
      drivingBehavior: doc.drivingBehavior ?? 0,
      vehicleCondition: doc.vehicleCondition ?? 0,
      usagePatterns: doc.usagePatterns ?? 0,
      updatedAt: doc.updatedAt,
      trend,
      previousOverall: doc.previousOverall ?? previous,
      recommendations,
      breakdown: [
        { label: "Speed compliance", score: Math.min(100, (doc.drivingBehavior ?? 0) + 2), weight: "25%" },
        { label: "Braking smoothness", score: Math.max(0, (doc.drivingBehavior ?? 0) - 3), weight: "25%" },
        { label: "Cornering & lane discipline", score: doc.drivingBehavior ?? 0, weight: "25%" },
        { label: "Trip consistency", score: doc.usagePatterns ?? 0, weight: "25%" },
      ],
    });
  } catch (err) {
    console.error("Mobility score error:", err);
    res.json(sampleMobilityScore);
  }
});

const sampleTrips = [
  { id: "st1", date: "2025-03-12", distanceKm: 45, durationMin: 62, startLocation: "San Francisco, CA", endLocation: "SFO Airport", score: 88 },
  { id: "st2", date: "2025-03-11", distanceKm: 23, durationMin: 35, startLocation: "Oakland", endLocation: "Downtown SF", score: 92 },
  { id: "st3", date: "2025-03-10", distanceKm: 78, durationMin: 95, startLocation: "San Jose", endLocation: "Palo Alto", score: 85 },
  { id: "st4", date: "2025-03-09", distanceKm: 12, durationMin: 18, startLocation: "Mission District", endLocation: "SOMA", score: 90 },
  { id: "st5", date: "2025-03-08", distanceKm: 56, durationMin: 72, startLocation: "SFO Airport", endLocation: "Berkeley", score: 82 },
];

app.get("/api/trips", async (req, res) => {
  const driverId = getDriverId(req);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  if (!isDbConnected()) {
    return res.json(sampleTrips.slice(0, limit));
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
    res.json(sampleTrips.slice(0, limit));
  }
});

app.get("/api/vehicle-health", async (req, res) => {
  const driverId = getDriverId(req);
  try {
    if (!isDbConnected()) {
      return res.json(buildVehicleHealthResponse({ vehicle: sampleVehicleHealth.vehicle, health: sampleVehicleHealth.health }));
    }
    await ensureDriverSeed();
    const doc = await VehicleHealth.findOne({ driverId }).lean();
    const payload = buildVehicleHealthResponse(doc ?? { vehicle: sampleVehicleHealth.vehicle, health: sampleVehicleHealth.health });
    return res.json(payload);
  } catch (err) {
    console.error("Vehicle health error:", err);
    return res.json(buildVehicleHealthResponse({ vehicle: sampleVehicleHealth.vehicle, health: sampleVehicleHealth.health }));
  }
});

// ---------- Driver: Vehicle details & digital twin (aggregated) ----------
const sampleVehicleSpecs = {
  year: 2024,
  fuelType: "Gasoline",
  engine: "2.5L 4-cylinder",
  transmission: "8-Speed Automatic",
  drivetrain: "FWD",
  bodyType: "Sedan",
  vin: "4T1BF1FK5NU123456",
};

const sampleLiveSnapshot = {
  odometerKm: 18420,
  fuelLevelPercent: 72,
  tirePressureStatus: "normal",
  lastServiceDate: "2025-01-15",
  nextServiceDueKm: 24000,
  lastUpdated: new Date().toISOString(),
};

const sampleVehicleDocuments = [
  { type: "registration", name: "Vehicle Registration (RC)", expiryDate: "2026-03-31", status: "valid" },
  { type: "insurance", name: "Insurance Certificate", expiryDate: "2025-09-15", status: "valid" },
  { type: "puc", name: "PUC / Emission Certificate", expiryDate: "2025-06-30", status: "valid" },
];

async function buildVehicleDetailsResponse(vehicleHealth) {
  const vehicle = vehicleHealth?.vehicle ?? sampleVehicleHealth.vehicle;
  const health = vehicleHealth?.health ?? sampleVehicleHealth.health;
  const make = (vehicle?.make || "Toyota").trim();
  const model = (vehicle?.model || "Camry 2024").replace(/\s*\d{4}$/, "").trim() || "Camry";
  const year = sampleVehicleSpecs.year;
  let recalls = [];
  try {
    recalls = await getRecalls(make, model, year);
  } catch (e) {
    console.warn("Recalls fetch failed:", e.message);
  }
  return {
    vehicle: vehicle ? { ...vehicle, year, vin: sampleVehicleSpecs.vin } : null,
    specs: sampleVehicleSpecs,
    health: health ?? sampleVehicleHealth.health,
    liveSnapshot: {
      odometerKm: sampleLiveSnapshot.odometerKm,
      fuelLevelPercent: sampleLiveSnapshot.fuelLevelPercent,
      tirePressureStatus: sampleLiveSnapshot.tirePressureStatus,
      lastServiceDate: sampleLiveSnapshot.lastServiceDate,
      nextServiceDueKm: sampleLiveSnapshot.nextServiceDueKm,
      lastUpdated: new Date().toISOString(),
    },
    documents: sampleVehicleDocuments,
    recalls,
    alerts: [],
  };
}

app.get("/api/driver/vehicle-details", async (req, res) => {
  try {
    let vehicleHealth = sampleVehicleHealth;
    if (isDbConnected()) {
      await ensureDriverSeed();
      const driverId = getDriverId(req);
      const doc = await VehicleHealth.findOne({ driverId }).lean();
      if (doc) {
        vehicleHealth = { vehicle: doc.vehicle ?? null, health: doc.health ?? emptyVehicleHealth.health };
      }
    }
    const payload = await buildVehicleDetailsResponse(vehicleHealth);
    return res.json(payload);
  } catch (err) {
    console.error("Vehicle details error:", err);
    const payload = await buildVehicleDetailsResponse(sampleVehicleHealth).catch(() => ({
      vehicle: sampleVehicleHealth.vehicle,
      specs: sampleVehicleSpecs,
      health: sampleVehicleHealth.health,
      liveSnapshot: sampleLiveSnapshot,
      documents: sampleVehicleDocuments,
      recalls: [],
      alerts: [],
    }));
    return res.json(payload);
  }
});

const sampleInsurance = {
  provider: "State Farm",
  policyNumber: "POL-2024-45678",
  expiryDate: "2025-09-15",
  premium: 1240,
  coverage: "Comprehensive",
};

app.get("/api/insurance", async (req, res) => {
  const driverId = getDriverId(req);
  if (!isDbConnected()) {
    return res.json(sampleInsurance);
  }
  try {
    await ensureDriverSeed();
    const doc = await Insurance.findOne({ driverId }).lean();
    if (!doc) return res.json(sampleInsurance);
    res.json({
      provider: doc.provider,
      policyNumber: doc.policyNumber,
      expiryDate: doc.expiryDate,
      premium: doc.premium ?? 0,
      coverage: doc.coverage || ""
    });
  } catch (err) {
    console.error("Insurance error:", err);
    res.json(sampleInsurance);
  }
});

// ---------- Driver: Insurance overview & premium calculator ----------
const sampleCoverageBreakdown = [
  { name: "Liability (Bodily Injury)", limit: "100/300k", premiumPortion: 420 },
  { name: "Property Damage", limit: "50k", premiumPortion: 280 },
  { name: "Collision", limit: "Actual cash value", premiumPortion: 320 },
  { name: "Comprehensive", limit: "Actual cash value", premiumPortion: 220 },
];

const PREMIUM_BASE = { liability: 600, collision: 400, comprehensive: 250 };
const AGE_FACTOR = (age) => (age < 25 ? 1.4 : age < 35 ? 1.1 : age < 55 ? 1 : 0.95);
const VEHICLE_FACTOR = (value) => 1 + Math.min(0.5, (value - 20000) / 60000);

app.get("/api/driver/insurance-overview", async (req, res) => {
  const driverId = getDriverId(req);
  try {
    let policy = sampleInsurance;
    if (isDbConnected()) {
      await ensureDriverSeed();
      const doc = await Insurance.findOne({ driverId }).lean();
      if (doc) policy = { provider: doc.provider, policyNumber: doc.policyNumber, expiryDate: doc.expiryDate, premium: doc.premium ?? 0, coverage: doc.coverage || "" };
    }
    return res.json({
      policy,
      coverageBreakdown: sampleCoverageBreakdown,
      calculatorRates: {
        baseLiability: PREMIUM_BASE.liability,
        baseCollision: PREMIUM_BASE.collision,
        baseComprehensive: PREMIUM_BASE.comprehensive,
        currency: "USD",
        period: "annual",
      },
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Insurance overview error:", err);
    return res.json({
      policy: sampleInsurance,
      coverageBreakdown: sampleCoverageBreakdown,
      calculatorRates: { baseLiability: 600, baseCollision: 400, baseComprehensive: 250, currency: "USD", period: "annual" },
      lastUpdated: new Date().toISOString(),
    });
  }
});

app.get("/api/driver/insurance-premium-estimate", (req, res) => {
  const vehicleValue = Math.max(5000, Math.min(100000, Number(req.query.vehicleValue) || 25000));
  const driverAge = Math.max(18, Math.min(80, Number(req.query.driverAge) || 35));
  const coverageType = (req.query.coverageType || "comprehensive").toLowerCase();
  const hasCollision = coverageType === "collision" || coverageType === "comprehensive";
  const hasComprehensive = coverageType === "comprehensive";
  const ageFactor = AGE_FACTOR(driverAge);
  const vehicleFactor = VEHICLE_FACTOR(vehicleValue);
  let base = PREMIUM_BASE.liability;
  if (hasCollision) base += PREMIUM_BASE.collision * vehicleFactor;
  if (hasComprehensive) base += PREMIUM_BASE.comprehensive * vehicleFactor;
  const estimatedPremium = Math.round(base * ageFactor);
  const breakdown = [
    { label: "Liability", amount: Math.round(PREMIUM_BASE.liability * ageFactor) },
    ...(hasCollision ? [{ label: "Collision", amount: Math.round(PREMIUM_BASE.collision * vehicleFactor * ageFactor) }] : []),
    ...(hasComprehensive ? [{ label: "Comprehensive", amount: Math.round(PREMIUM_BASE.comprehensive * vehicleFactor * ageFactor) }] : []),
  ];
  return res.json({ estimatedPremium, breakdown, currency: "USD", period: "annual" });
});

app.get("/api/drivers", (req, res) => {
  res.json([]);
});

// --- Fleet management (single source: defaultFleetVehicles / FleetVehicle collection) ---
const defaultFleetVehicles = [
  { plateNumber: "AB-1234", model: "Ford Transit", status: "active", latitude: 37.7749, longitude: -122.4194 },
  { plateNumber: "CD-5678", model: "Mercedes Sprinter", status: "active", latitude: 37.7849, longitude: -122.4094 },
  { plateNumber: "EF-9012", model: "Toyota Hiace", status: "maintenance", latitude: null, longitude: null },
];
const defaultFleetDashboard = { trips: 120, fuel: 80, maintenance: 30, vehicleCount: defaultFleetVehicles.length };

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

const defaultFleetOrganizations = [
  { name: "AutoSphere Fleet West", slug: "autosphere-west", contactEmail: "fleet-west@autosphere.ai", contactPhone: "+1-415-555-0100", address: "San Francisco, CA", status: "active" },
  { name: "Metro Logistics", slug: "metro-logistics", contactEmail: "admin@metrologistics.com", contactPhone: "+1-415-555-0200", address: "Oakland, CA", status: "active" },
];
const defaultFleetRoles = [
  { name: "Fleet Admin", slug: "fleet-admin", description: "Full access to fleet, organizations, and users", permissions: ["fleet:read", "fleet:write", "orgs:manage", "roles:manage"] },
  { name: "Fleet Manager", slug: "fleet-manager", description: "Manage vehicles, drivers, and maintenance", permissions: ["fleet:read", "fleet:write", "vehicles:manage", "drivers:manage"] },
  { name: "Driver", slug: "driver", description: "View own trips and vehicle", permissions: ["fleet:read", "trips:read"] },
  { name: "Viewer", slug: "viewer", description: "Read-only fleet dashboard", permissions: ["fleet:read"] },
];

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

async function ensureFleetAdminSeed() {
  if (!isDbConnected()) return;
  if ((await FleetOrganization.countDocuments()) === 0) {
    await FleetOrganization.insertMany(defaultFleetOrganizations);
    console.log("Fleet: seeded organizations.");
  }
  if ((await FleetRole.countDocuments()) === 0) {
    await FleetRole.insertMany(defaultFleetRoles);
    console.log("Fleet: seeded roles.");
  }
}

app.get("/api/fleet/dashboard", async (req, res) => {
  if (!isDbConnected()) return res.json(defaultFleetDashboard);
  try {
    await ensureFleetSeed();
    const vehicleCount = await FleetVehicle.countDocuments();
    const maintenanceCount = await FleetMaintenance.countDocuments();
    const tripDocs = await Trip.find().lean();
    const trips = tripDocs.length;
    const totalKm = tripDocs.reduce((a, t) => a + (t.distanceKm || 0), 0);
    const fuel = totalKm > 0 ? Math.min(100, Math.round((totalKm / 15) * 2)) : 80;
    return res.json({ trips, fuel, maintenance: maintenanceCount, vehicleCount });
  } catch (err) {
    console.error("Fleet dashboard error:", err);
    res.json(defaultFleetDashboard);
  }
});

function dedupeVehiclesByPlate(list) {
  const seen = new Set();
  return list.filter((v) => {
    const plate = (v.plateNumber || "").trim().toLowerCase();
    if (!plate || seen.has(plate)) return false;
    seen.add(plate);
    return true;
  });
}

app.get("/api/fleet/vehicles", async (req, res) => {
  if (!isDbConnected()) {
    const list = defaultFleetVehicles.map((v, i) => ({ _id: `mock-${i}`, ...v }));
    return res.json(dedupeVehiclesByPlate(list));
  }
  try {
    await ensureFleetSeed();
    const list = await FleetVehicle.find().lean();
    const mapped = list.map((v) => ({ ...v, id: v._id?.toString() }));
    return res.json(dedupeVehiclesByPlate(mapped));
  } catch (err) {
    console.error("Fleet vehicles error:", err);
    const list = defaultFleetVehicles.map((v, i) => ({ _id: `mock-${i}`, ...v }));
    return res.json(dedupeVehiclesByPlate(list));
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
    return res.status(201).json({ _id: `mock-offline-${Date.now()}`, ...payload });
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

app.get("/api/fleet/organizations", async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json(defaultFleetOrganizations.map((o, i) => ({ _id: `org-${i}`, ...o })));
    }
    await ensureFleetAdminSeed();
    const list = await FleetOrganization.find().lean();
    return res.json(list.map((o) => ({ ...o, id: o._id?.toString() })));
  } catch (err) {
    console.error("Fleet organizations error:", err);
    return res.json(defaultFleetOrganizations.map((o, i) => ({ _id: `org-${i}`, ...o })));
  }
});

app.get("/api/fleet/roles", async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json(defaultFleetRoles.map((r, i) => ({ _id: `role-${i}`, ...r })));
    }
    await ensureFleetAdminSeed();
    const list = await FleetRole.find().lean();
    return res.json(list.map((r) => ({ ...r, id: r._id?.toString() })));
  } catch (err) {
    console.error("Fleet roles error:", err);
    return res.json(defaultFleetRoles.map((r, i) => ({ _id: `role-${i}`, ...r })));
  }
});

app.get("/api/fleet/trips", async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
  try {
    if (!isDbConnected()) {
      return res.json(sampleTripsForSeed.map((t, i) => ({ id: `trip-${i}`, ...t })));
    }
    await ensureDriverSeed();
    const list = await Trip.find().sort({ date: -1 }).limit(limit).lean();
    return res.json(list.map((t) => ({
      id: t._id?.toString(),
      driverId: t.driverId,
      date: t.date,
      distanceKm: t.distanceKm,
      durationMin: t.durationMin,
      startLocation: t.startLocation || "",
      endLocation: t.endLocation || "",
      score: t.score ?? 0,
    })));
  } catch (err) {
    console.error("Fleet trips error:", err);
    return res.json(sampleTripsForSeed.map((t, i) => ({ id: `trip-${i}`, ...t })));
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

// ---------- Real-world API routes (used by all subsections) ----------

// Fallback weather when Open-Meteo is unavailable (driver FuelTracker subsection)
const fallbackWeather = { temp: 18, description: "Clear", code: 0 };

app.get("/api/weather", async (req, res) => {
  try {
    const lat = Number(req.query.lat) || 37.77;
    const lng = Number(req.query.lng) || -122.41;
    const weather = await getWeather(lat, lng);
    res.json(weather);
  } catch (err) {
    console.error("Weather API error:", err);
    res.status(200).json(fallbackWeather);
  }
});

app.get("/api/recalls", async (req, res) => {
  try {
    const make = req.query.make || "Toyota";
    const model = req.query.model || "Camry";
    const year = Number(req.query.year) || 2024;
    const recalls = await getRecalls(make, model, year);
    res.json(recalls);
  } catch (err) {
    console.error("Recalls API error:", err);
    res.status(200).json([]);
  }
});

app.get("/api/service-centers", (req, res) => {
  try {
    const lat = Number(req.query.lat) || 37.77;
    const lng = Number(req.query.lng) || -122.41;
    const list = REAL_SERVICE_CENTERS.map((s) => ({
      ...s,
      distanceKm: Math.round(
        111 * Math.sqrt(Math.pow((s.lat - lat) * Math.cos((lng * Math.PI) / 180), 2) + Math.pow(s.lng - lng, 2))
      ) / 10,
    })).sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
    res.json(list);
  } catch (err) {
    console.error("Service centers error:", err);
    res.status(200).json(
      REAL_SERVICE_CENTERS.map((s, i) => ({ ...s, distanceKm: (i + 1) * 2 })).sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0))
    );
  }
});

app.get("/api/analytics/emissions", async (req, res) => {
  try {
    if (!isDbConnected()) {
      const fallback = {
        totalKgCO2: 2840,
        petrolKgCO2: 1800,
        dieselKgCO2: 640,
        electricKgCO2: 400,
        bySegment: [
          { segment: "Sedan", kgCO2: 1200 },
          { segment: "SUV", kgCO2: 980 },
          { segment: "Van", kgCO2: 660 },
        ],
        period: "March 2025",
        factors: EMISSION_FACTORS,
      };
      return res.json(fallback);
    }
    await ensureDriverSeed();
    const trips = await Trip.find().lean();
    const totalKm = trips.reduce((a, t) => a + (t.distanceKm || 0), 0);
    const petrolKm = totalKm * 0.6;
    const dieselKm = totalKm * 0.35;
    const electricKm = totalKm * 0.05;
    const totalKgCO2 =
      petrolKm * EMISSION_FACTORS.petrolPerKmKgCO2 +
      dieselKm * EMISSION_FACTORS.dieselPerKmKgCO2 +
      electricKm * EMISSION_FACTORS.electricPerKmKgCO2;
    res.json({
      totalKgCO2: Math.round(totalKgCO2),
      petrolKgCO2: Math.round(petrolKm * EMISSION_FACTORS.petrolPerKmKgCO2),
      dieselKgCO2: Math.round(dieselKm * EMISSION_FACTORS.dieselPerKmKgCO2),
      electricKgCO2: Math.round(electricKm * EMISSION_FACTORS.electricPerKmKgCO2),
      totalDistanceKm: totalKm,
      bySegment: [
        { segment: "Sedan", kgCO2: Math.round(totalKgCO2 * 0.42) },
        { segment: "SUV", kgCO2: Math.round(totalKgCO2 * 0.35) },
        { segment: "Van", kgCO2: Math.round(totalKgCO2 * 0.23) },
      ],
      period: "Current month",
      factors: EMISSION_FACTORS,
    });
  } catch (err) {
    console.error("Emissions analytics error:", err);
    res.status(500).json({ error: "Analytics unavailable" });
  }
});

app.get("/api/analytics/mobility-distribution", async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json({
        buckets: [
          { range: "0-20", count: 2 },
          { range: "21-40", count: 5 },
          { range: "41-60", count: 12 },
          { range: "61-80", count: 28 },
          { range: "81-100", count: 18 },
        ],
        average: 72,
      });
    }
    await ensureDriverSeed();
    const scores = await MobilityScore.find().lean();
    const buckets = { "0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0 };
    scores.forEach((s) => {
      const o = s.overall ?? 0;
      if (o <= 20) buckets["0-20"]++;
      else if (o <= 40) buckets["21-40"]++;
      else if (o <= 60) buckets["41-60"]++;
      else if (o <= 80) buckets["61-80"]++;
      else buckets["81-100"]++;
    });
    const total = scores.length || 1;
    const average = scores.reduce((a, s) => a + (s.overall ?? 0), 0) / total;
    res.json({
      buckets: Object.entries(buckets).map(([range, count]) => ({ range, count })),
      average: Math.round(average),
    });
  } catch (err) {
    console.error("Mobility distribution error:", err);
    res.status(500).json({ error: "Analytics unavailable" });
  }
});

app.get("/api/analytics/parking-revenue", async (req, res) => {
  try {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const revenue = [4200, 4850, 5100, 4900, 5300, 5600];
    res.json({ months, revenue, currency: "USD" });
  } catch (err) {
    res.status(500).json({ error: "Analytics unavailable" });
  }
});

// ---------- Driver: driving analytics & risk exposure ----------
const defaultDrivingAnalytics = {
  riskScore: 24,
  riskLevel: "low",
  behavior: { speedScore: 88, brakingScore: 82, turningScore: 85 },
  timeOfDayRisk: [
    { period: "06:00–12:00", label: "Morning", riskLevel: "low", score: 12 },
    { period: "12:00–18:00", label: "Afternoon", riskLevel: "low", score: 18 },
    { period: "18:00–22:00", label: "Evening", riskLevel: "medium", score: 28 },
    { period: "22:00–06:00", label: "Night", riskLevel: "high", score: 42 },
  ],
  recommendations: [
    "Avoid night driving when possible; risk is highest 22:00–06:00.",
    "Smooth braking improves your braking score; allow more following distance.",
    "Maintain consistent speed on highways to improve speed score.",
  ],
};

app.get("/api/driver/driving-analytics", async (req, res) => {
  const driverId = getDriverId(req);
  try {
    if (!isDbConnected()) {
      return res.json(defaultDrivingAnalytics);
    }
    await ensureDriverSeed();
    const trips = await Trip.find({ driverId }).sort({ date: -1 }).limit(50).lean();
    const mobility = await MobilityScore.findOne({ driverId }).lean();
    const overall = mobility?.overall ?? 86;
    const riskScore = Math.round(100 - overall);
    const behavior = {
      speedScore: mobility?.drivingBehavior ?? 88,
      brakingScore: Math.min(95, (mobility?.drivingBehavior ?? 88) - 6),
      turningScore: Math.min(92, (mobility?.drivingBehavior ?? 88) + 2),
    };
    const avgTripScore = trips.length ? Math.round(trips.reduce((a, t) => a + (t.score || 0), 0) / trips.length) : 85;
    const eveningRisk = avgTripScore < 80 ? 35 : 28;
    const timeOfDayRisk = [
      { period: "06:00–12:00", label: "Morning", riskLevel: "low", score: Math.max(8, 20 - Math.floor(avgTripScore / 10)) },
      { period: "12:00–18:00", label: "Afternoon", riskLevel: "low", score: Math.max(12, 25 - Math.floor(avgTripScore / 8)) },
      { period: "18:00–22:00", label: "Evening", riskLevel: eveningRisk > 30 ? "medium" : "low", score: eveningRisk },
      { period: "22:00–06:00", label: "Night", riskLevel: "high", score: Math.min(50, 30 + riskScore) },
    ];
    const recommendations = [];
    if (behavior.brakingScore < 80) recommendations.push("Smooth braking improves your braking score; allow more following distance.");
    if (behavior.speedScore < 85) recommendations.push("Reduce highway speed variance to improve your speed score.");
    if (timeOfDayRisk[3].score > 35) recommendations.push("Avoid night driving when possible; risk is highest 22:00–06:00.");
    if (recommendations.length === 0) recommendations.push("Keep up the good driving. Maintain consistent speed and following distance.");
    return res.json({
      riskScore,
      riskLevel: riskScore > 40 ? "high" : riskScore > 25 ? "medium" : "low",
      behavior,
      timeOfDayRisk,
      recommendations,
    });
  } catch (err) {
    console.error("Driving analytics error:", err);
    return res.json(defaultDrivingAnalytics);
  }
});

// ---------- Driver: parking map & booking ----------
const defaultParkingLots = [
  { id: "lot-1", name: "SOMA Garage", address: "555 Howard St, San Francisco, CA", availableSpots: 12, totalSpots: 50, pricePerHour: 4.5, lat: 37.787, lng: -122.396, distanceKm: 0.8 },
  { id: "lot-2", name: "Mission Bay Lot", address: "255 King St, San Francisco, CA", availableSpots: 28, totalSpots: 80, pricePerHour: 3.5, lat: 37.769, lng: -122.393, distanceKm: 1.5 },
  { id: "lot-3", name: "Downtown Plaza", address: "100 1st St, San Francisco, CA", availableSpots: 5, totalSpots: 40, pricePerHour: 6, lat: 37.785, lng: -122.401, distanceKm: 0.5 },
  { id: "lot-4", name: "Embarcadero Center", address: "2 Embarcadero Center, San Francisco, CA", availableSpots: 18, totalSpots: 60, pricePerHour: 5, lat: 37.795, lng: -122.394, distanceKm: 1.2 },
];

let activeParkingBooking = null;

app.get("/api/driver/parking", async (req, res) => {
  try {
    const lat = Number(req.query.lat) || 37.77;
    const lng = Number(req.query.lng) || -122.41;
    const lots = defaultParkingLots.map((l) => ({ ...l, distanceKm: (l.distanceKm ?? 1).toFixed(1) }));
    return res.json({ lots, activeBooking: activeParkingBooking });
  } catch (err) {
    console.error("Driver parking error:", err);
    const lots = defaultParkingLots.map((l) => ({ ...l, distanceKm: (l.distanceKm ?? 1).toFixed(1) }));
    return res.json({ lots, activeBooking: null });
  }
});

app.post("/api/driver/parking/booking", async (req, res) => {
  const { lotId, durationHours } = req.body || {};
  try {
    const lot = defaultParkingLots.find((l) => l.id === lotId);
    if (!lot) return res.status(400).json({ error: "Lot not found" });
    const hours = Math.min(24, Math.max(0.5, Number(durationHours) || 1));
    const totalPrice = (lot.pricePerHour * hours).toFixed(2);
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + hours * 60 * 60 * 1000);
    activeParkingBooking = {
      id: `book-${Date.now()}`,
      lotId: lot.id,
      lotName: lot.name,
      address: lot.address,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationHours: hours,
      totalPrice: parseFloat(totalPrice),
    };
    return res.status(201).json({ success: true, booking: activeParkingBooking });
  } catch (err) {
    console.error("Parking booking error:", err);
    res.status(200).json({ success: false, error: "Booking failed", booking: null });
  }
});

app.delete("/api/driver/parking/booking", async (req, res) => {
  activeParkingBooking = null;
  res.json({ success: true });
});

// ---------- Driver: EV charging stations & booking ----------
const defaultEVStations = [
  { id: "ev-1", name: "Electrify America - SOMA", address: "699 Minna St, San Francisco, CA", availableConnectors: 3, totalConnectors: 4, connectorTypes: ["CCS", "CHAdeMO"], powerKw: 150, pricePerKwh: 0.43, lat: 37.776, lng: -122.409, distanceKm: 0.6 },
  { id: "ev-2", name: "Tesla Supercharger - Mission Bay", address: "255 King St, San Francisco, CA", availableConnectors: 6, totalConnectors: 8, connectorTypes: ["Tesla"], powerKw: 250, pricePerKwh: 0.36, lat: 37.769, lng: -122.393, distanceKm: 1.4 },
  { id: "ev-3", name: "ChargePoint - Downtown", address: "100 1st St, San Francisco, CA", availableConnectors: 2, totalConnectors: 4, connectorTypes: ["CCS", "Type 2"], powerKw: 62, pricePerKwh: 0.38, lat: 37.785, lng: -122.401, distanceKm: 0.5 },
  { id: "ev-4", name: "EVgo - Embarcadero", address: "2 Embarcadero Center, San Francisco, CA", availableConnectors: 4, totalConnectors: 6, connectorTypes: ["CCS", "CHAdeMO"], powerKw: 100, pricePerKwh: 0.45, lat: 37.795, lng: -122.394, distanceKm: 1.1 },
];

let activeEVChargingSession = null;

// Mock usage for analytics (could come from DB)
const defaultUsageSummary = {
  totalKwhThisMonth: 124,
  totalCostThisMonth: 48.52,
  sessionCountThisMonth: 8,
  lastSessionDate: new Date().toISOString().slice(0, 10),
  currency: "USD",
};

app.get("/api/driver/ev-charging", async (req, res) => {
  try {
    const lat = Number(req.query.lat) || 37.77;
    const lng = Number(req.query.lng) || -122.41;
    const stations = defaultEVStations.map((s) => ({ ...s, distanceKm: (s.distanceKm ?? 1).toFixed(1) }));
    return res.json({
      stations,
      activeSession: activeEVChargingSession,
      usageSummary: defaultUsageSummary,
    });
  } catch (err) {
    console.error("EV charging error:", err);
    const stations = defaultEVStations.map((s) => ({ ...s, distanceKm: (s.distanceKm ?? 1).toFixed(1) }));
    return res.json({ stations, activeSession: null, usageSummary: defaultUsageSummary });
  }
});

app.post("/api/driver/ev-charging/booking", async (req, res) => {
  const { stationId, connectorType, durationMinutes } = req.body || {};
  try {
    const station = defaultEVStations.find((s) => s.id === stationId);
    if (!station) return res.status(400).json({ error: "Station not found" });
    const type = connectorType || (station.connectorTypes && station.connectorTypes[0]) || "CCS";
    const mins = Math.min(120, Math.max(15, Number(durationMinutes) || 30));
    const estimatedKwh = Math.round((station.powerKw * (mins / 60)) * 10) / 10;
    const totalCost = Math.round(station.pricePerKwh * estimatedKwh * 100) / 100;
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + mins * 60 * 1000);
    activeEVChargingSession = {
      id: `ev-session-${Date.now()}`,
      stationId: station.id,
      stationName: station.name,
      address: station.address,
      connectorType: type,
      powerKw: station.powerKw,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationMinutes: mins,
      estimatedKwh,
      pricePerKwh: station.pricePerKwh,
      totalCost,
    };
    return res.status(201).json({ success: true, session: activeEVChargingSession });
  } catch (err) {
    console.error("EV charging booking error:", err);
    res.status(200).json({ success: false, error: "Booking failed", session: null });
  }
});

app.delete("/api/driver/ev-charging/booking", async (req, res) => {
  activeEVChargingSession = null;
  res.json({ success: true });
});

// ---------- Driver: Emergency & accident detection ----------
const defaultEmergencyContacts = [
  { id: "ec-1", name: "Jane Doe", phone: "+1 555-0101", type: "family", isPrimary: true },
  { id: "ec-2", name: "Police", phone: "911", type: "emergency", isPrimary: false },
  { id: "ec-3", name: "AutoSphere Insurance", phone: "+1 555-0199", type: "insurer", isPrimary: false },
];

let crashDetectionEnabled = true;
const recentEmergencyAlerts = [];

app.get("/api/driver/emergency", async (req, res) => {
  try {
    return res.json({
      emergencyContacts: defaultEmergencyContacts,
      crashDetectionEnabled,
      lastKnownLocation: { lat: 37.77, lng: -122.41, updatedAt: new Date().toISOString() },
      recentAlerts: recentEmergencyAlerts.slice(-10).reverse(),
    });
  } catch (err) {
    console.error("Emergency config error:", err);
    return res.json({
      emergencyContacts: defaultEmergencyContacts,
      crashDetectionEnabled: true,
      lastKnownLocation: { lat: 37.77, lng: -122.41, updatedAt: new Date().toISOString() },
      recentAlerts: [],
    });
  }
});

app.post("/api/driver/emergency/sos", async (req, res) => {
  const { message, lat, lng } = req.body || {};
  try {
    const alertId = `sos-${Date.now()}`;
    const dispatchedAt = new Date().toISOString();
    const alert = {
      id: alertId,
      type: "sos",
      message: message || "Driver triggered SOS",
      lat: Number(lat) || 37.77,
      lng: Number(lng) || -122.41,
      dispatchedAt,
      status: "dispatched",
    };
    recentEmergencyAlerts.push(alert);
    if (recentEmergencyAlerts.length > 50) recentEmergencyAlerts.shift();
    return res.status(201).json({ success: true, alertId, dispatchedAt, alert });
  } catch (err) {
    console.error("SOS error:", err);
    res.status(200).json({ success: false, error: "SOS dispatch failed", alertId: null, dispatchedAt: null, alert: null });
  }
});

app.post("/api/driver/emergency/incident", async (req, res) => {
  const { type, severity, description, lat, lng } = req.body || {};
  try {
    const incidentId = `incident-${Date.now()}`;
    const reportedAt = new Date().toISOString();
    const incident = {
      id: incidentId,
      type: type || "accident",
      severity: severity || "unknown",
      description: description || "",
      lat: Number(lat) || 37.77,
      lng: Number(lng) || -122.41,
      reportedAt,
      status: "reported",
    };
    recentEmergencyAlerts.push(incident);
    if (recentEmergencyAlerts.length > 50) recentEmergencyAlerts.shift();
    return res.status(201).json({ success: true, incidentId, reportedAt, incident });
  } catch (err) {
    console.error("Incident report error:", err);
    res.status(200).json({ success: false, error: "Report failed", incidentId: null, reportedAt: null, incident: null });
  }
});

app.patch("/api/driver/emergency/settings", async (req, res) => {
  const { crashDetectionEnabled: enabled } = req.body || {};
  if (typeof enabled === "boolean") crashDetectionEnabled = enabled;
  return res.json({ success: true, crashDetectionEnabled });
});

// ---------- Driver: Roadside assistance ----------
const roadsideServiceTypes = [
  { id: "towing", name: "Towing", description: "Vehicle tow to nearest shop", estimatedMin: 45 },
  { id: "battery", name: "Battery jump-start", description: "Jump-start or battery replacement", estimatedMin: 30 },
  { id: "flat_tire", name: "Flat tire", description: "Tire change or repair", estimatedMin: 35 },
  { id: "lockout", name: "Lockout", description: "Unlock vehicle", estimatedMin: 25 },
  { id: "fuel", name: "Fuel delivery", description: "Emergency fuel delivery", estimatedMin: 40 },
];

let activeRoadsideRequest = null;
const recentRoadsideRequests = [];

app.get("/api/driver/roadside", async (req, res) => {
  try {
    return res.json({
      serviceTypes: roadsideServiceTypes,
      activeRequest: activeRoadsideRequest,
      recentRequests: recentRoadsideRequests.slice(-5).reverse(),
      lastKnownLocation: { lat: 37.77, lng: -122.41, address: "San Francisco, CA", updatedAt: new Date().toISOString() },
    });
  } catch (err) {
    console.error("Roadside config error:", err);
    return res.json({
      serviceTypes: roadsideServiceTypes,
      activeRequest: null,
      recentRequests: [],
      lastKnownLocation: { lat: 37.77, lng: -122.41, address: "San Francisco, CA", updatedAt: new Date().toISOString() },
    });
  }
});

app.post("/api/driver/roadside/request", async (req, res) => {
  const { serviceType, vehicleDescription, lat, lng, notes } = req.body || {};
  try {
    const service = roadsideServiceTypes.find((s) => s.id === serviceType);
    if (!service) return res.status(400).json({ error: "Invalid service type" });
    const requestId = `roadside-${Date.now()}`;
    const requestedAt = new Date().toISOString();
    const etaMinutes = service.estimatedMin || 35;
    const etaTime = new Date(Date.now() + etaMinutes * 60 * 1000).toISOString();
    activeRoadsideRequest = {
      id: requestId,
      serviceType: service.id,
      serviceName: service.name,
      status: "dispatched",
      requestedAt,
      etaMinutes,
      etaTime,
      helperName: "Roadside Pro — Driver en route",
      helperPhone: "+1 555-ROAD-HELP",
      vehicleDescription: vehicleDescription || "",
      notes: notes || "",
      location: { lat: Number(lat) || 37.77, lng: Number(lng) || -122.41 },
    };
    recentRoadsideRequests.push({ ...activeRoadsideRequest });
    if (recentRoadsideRequests.length > 20) recentRoadsideRequests.shift();
    return res.status(201).json({ success: true, request: activeRoadsideRequest });
  } catch (err) {
    console.error("Roadside request error:", err);
    res.status(200).json({ success: false, error: "Request failed", request: null });
  }
});

app.delete("/api/driver/roadside/request", async (req, res) => {
  activeRoadsideRequest = null;
  res.json({ success: true });
});

// ---------- Driver: Resale value estimator ----------
const resaleBasePrices = {
  "Toyota Camry": { 2020: 22000, 2021: 24000, 2022: 26000, 2023: 28000, 2024: 30000 },
  "Toyota Corolla": { 2020: 18000, 2021: 19500, 2022: 21000, 2023: 22500, 2024: 24000 },
  "Honda Accord": { 2020: 23000, 2021: 25000, 2022: 27000, 2023: 29000, 2024: 31000 },
  "Honda Civic": { 2020: 19000, 2021: 20500, 2022: 22000, 2023: 23500, 2024: 25000 },
  "Ford F-150": { 2020: 35000, 2021: 38000, 2022: 40000, 2023: 42000, 2024: 45000 },
  "Ford Transit": { 2020: 32000, 2021: 34000, 2022: 36000, 2023: 38000, 2024: 40000 },
  "Tesla Model 3": { 2020: 38000, 2021: 40000, 2022: 42000, 2023: 38000, 2024: 35000 },
  "Chevrolet Silverado": { 2020: 32000, 2021: 35000, 2022: 37000, 2023: 39000, 2024: 41000 },
};

const RESALE_MAKES = ["Toyota", "Honda", "Ford", "Tesla", "Chevrolet"];
const RESALE_MODELS = {
  Toyota: ["Camry", "Corolla", "RAV4", "Highlander"],
  Honda: ["Accord", "Civic", "CR-V", "Pilot"],
  Ford: ["F-150", "Transit", "Mustang", "Explorer"],
  Tesla: ["Model 3", "Model Y", "Model S"],
  Chevrolet: ["Silverado", "Equinox", "Malibu"],
};

function getResaleBasePrice(make, model, year) {
  const key = `${make} ${model}`;
  const byYear = resaleBasePrices[key];
  if (byYear && byYear[year]) return byYear[year];
  const fallback = 25000;
  const yearFactor = 1 - (new Date().getFullYear() - Number(year)) * 0.08;
  return Math.round(fallback * Math.max(0.3, yearFactor));
}

app.get("/api/driver/resale-estimate", async (req, res) => {
  const make = (req.query.make || "Toyota").toString().trim();
  const model = (req.query.model || "Camry").toString().trim();
  const year = Number(req.query.year) || new Date().getFullYear() - 2;
  const mileage = Number(req.query.mileage) || 30000;
  const condition = (req.query.condition || "good").toString().toLowerCase();
  try {
    const base = getResaleBasePrice(make, model, year);
    const conditionMultiplier = { excellent: 1.05, good: 1, fair: 0.82, poor: 0.65 }[condition] || 1;
    const mileageDepreciation = Math.min(0.4, (mileage / 10000) * 0.015);
    const value = Math.round(base * conditionMultiplier * (1 - mileageDepreciation));
    const low = Math.round(value * 0.92);
    const high = Math.round(value * 1.08);
    const factors = [
      { name: "Mileage", impact: mileage < 20000 ? "Low impact" : mileage < 60000 ? "Moderate impact" : "High impact", detail: `${mileage.toLocaleString()} mi` },
      { name: "Condition", impact: condition.charAt(0).toUpperCase() + condition.slice(1), detail: conditionMultiplier === 1 ? "Average" : conditionMultiplier > 1 ? "Above average" : "Below average" },
      { name: "Market", impact: "Current demand", detail: "Regional average" },
    ];
    return res.json({
      make,
      model,
      year,
      mileage,
      condition,
      estimatedValueLow: low,
      estimatedValueHigh: high,
      estimatedValueMid: value,
      currency: "USD",
      factors,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Resale estimate error:", err);
    const value = 22000;
    return res.json({
      make,
      model,
      year,
      mileage,
      condition,
      estimatedValueLow: Math.round(value * 0.92),
      estimatedValueHigh: Math.round(value * 1.08),
      estimatedValueMid: value,
      currency: "USD",
      factors: [
        { name: "Mileage", impact: "Moderate impact", detail: `${mileage.toLocaleString()} mi` },
        { name: "Condition", impact: condition, detail: "—" },
        { name: "Market", impact: "Current demand", detail: "—" },
      ],
      lastUpdated: new Date().toISOString(),
    });
  }
});

app.get("/api/driver/resale-options", async (req, res) => {
  try {
    return res.json({ makes: RESALE_MAKES, models: RESALE_MODELS });
  } catch (err) {
    console.error("Resale options error:", err);
    return res.json({ makes: RESALE_MAKES, models: RESALE_MODELS });
  }
});

// ---------- Driver: Loan & EMI calculator ----------
function calculateEMI(principal, annualRatePercent, tenureMonths) {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  const r = annualRatePercent / 100 / 12;
  if (r === 0) return principal / tenureMonths;
  return (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);
}

function getAmortizationSchedule(principal, annualRatePercent, tenureMonths, emi, maxRows = 12) {
  const r = annualRatePercent / 100 / 12;
  const schedule = [];
  let balance = principal;
  let month = 0;
  while (balance > 0.01 && month < tenureMonths) {
    const interestPayment = balance * r;
    const principalPayment = Math.min(emi - interestPayment, balance);
    balance -= principalPayment;
    month++;
    if (month <= maxRows || month === tenureMonths) {
      schedule.push({
        month,
        emi: Math.round(emi * 100) / 100,
        principal: Math.round(principalPayment * 100) / 100,
        interest: Math.round(interestPayment * 100) / 100,
        balance: Math.round(Math.max(0, balance) * 100) / 100,
      });
    }
  }
  return schedule;
}

const LOAN_SAMPLE_RATES = [
  { tenureYears: 3, ratePercent: 7.5, label: "3-year" },
  { tenureYears: 5, ratePercent: 8.0, label: "5-year" },
  { tenureYears: 7, ratePercent: 8.5, label: "7-year" },
];

app.get("/api/driver/loan-rates", async (req, res) => {
  try {
    return res.json({ rates: LOAN_SAMPLE_RATES, currency: "USD" });
  } catch (err) {
    console.error("Loan rates error:", err);
    return res.json({ rates: LOAN_SAMPLE_RATES, currency: "USD" });
  }
});

app.get("/api/driver/loan-calculate", async (req, res) => {
  const principal = Number(req.query.principal) || 25000;
  const downPayment = Math.max(0, Number(req.query.downPayment) || 0);
  const rate = Number(req.query.rate) || 8.5;
  const tenureYears = Number(req.query.tenure) || 5;
  const tenureMonths = Math.max(1, Math.min(360, tenureYears * 12));
  const principalUsed = Math.max(0, principal - downPayment);
  try {
    const emi = calculateEMI(principalUsed, rate, tenureMonths);
    const totalPayment = Math.round(emi * tenureMonths * 100) / 100;
    const totalInterest = Math.round((totalPayment - principalUsed) * 100) / 100;
    const schedule = getAmortizationSchedule(principalUsed, rate, tenureMonths, emi, 12);
    return res.json({
      principal,
      downPayment,
      principalUsed,
      ratePercent: rate,
      tenureYears,
      tenureMonths,
      emi: Math.round(emi * 100) / 100,
      totalPayment,
      totalInterest,
      currency: "USD",
      amortizationSchedule: schedule,
    });
  } catch (err) {
    console.error("Loan calculate error:", err);
    const emi = calculateEMI(principalUsed, rate, tenureMonths);
    const totalPayment = Math.round(emi * tenureMonths * 100) / 100;
    const totalInterest = Math.round((totalPayment - principalUsed) * 100) / 100;
    return res.json({
      principal,
      downPayment,
      principalUsed,
      ratePercent: rate,
      tenureYears,
      tenureMonths,
      emi: Math.round(emi * 100) / 100,
      totalPayment,
      totalInterest,
      currency: "USD",
      amortizationSchedule: getAmortizationSchedule(principalUsed, rate, tenureMonths, emi, 12),
    });
  }
});

// ---------- Driver: Marketplace ----------
const MARKETPLACE_CATEGORIES = [
  { id: "accessories", name: "Accessories", description: "Gadgets, interior, exterior" },
  { id: "services", name: "Services", description: "Detailing, repairs, insurance" },
  { id: "deals", name: "Deals", description: "Offers and discounts" },
];

const MARKETPLACE_LISTINGS = [
  { id: "mp-1", categoryId: "accessories", title: "Dash cam Pro", description: "1080p dual-channel dash cam with night vision", price: 89.99, currency: "USD", featured: true },
  { id: "mp-2", categoryId: "accessories", title: "All-weather floor mats", description: "Custom-fit rubber mats, front & rear", price: 129.99, currency: "USD", featured: false },
  { id: "mp-3", categoryId: "accessories", title: "Phone mount (vent)", description: "Magnetic vent mount, universal", price: 24.99, currency: "USD", featured: false },
  { id: "mp-4", categoryId: "services", title: "Full interior detailing", description: "Deep clean, leather conditioning, odor removal", price: 149, currency: "USD", featured: true },
  { id: "mp-5", categoryId: "services", title: "Brake pad replacement", description: "Quality pads + labor, per axle", price: 199, currency: "USD", featured: false },
  { id: "mp-6", categoryId: "services", title: "Oil change + filter", description: "Synthetic oil, multi-point check", price: 59.99, currency: "USD", featured: false },
  { id: "mp-7", categoryId: "deals", title: "20% off first service", description: "New customer discount on any service", price: 0, currency: "USD", featured: true, discount: "20% off" },
  { id: "mp-8", categoryId: "deals", title: "Tire rotation free", description: "Free rotation with tire purchase", price: 0, currency: "USD", featured: false, discount: "Free" },
  { id: "mp-9", categoryId: "deals", title: "Bundle: mats + cam", description: "Floor mats + dash cam bundle", price: 189.99, currency: "USD", featured: true, discount: "Save 30" },
];

app.get("/api/driver/marketplace", async (req, res) => {
  try {
    const categoryId = (req.query.category || "").toString();
    let listings = MARKETPLACE_LISTINGS;
    if (categoryId) {
      listings = listings.filter((l) => l.categoryId === categoryId);
    }
    return res.json({
      categories: MARKETPLACE_CATEGORIES,
      listings,
      currency: "USD",
    });
  } catch (err) {
    console.error("Marketplace error:", err);
    return res.json({
      categories: MARKETPLACE_CATEGORIES,
      listings: MARKETPLACE_LISTINGS,
      currency: "USD",
    });
  }
});

// ---------- Driver subsections: driving reports, service history ----------
const sampleDrivingReportWeek = {
  totalTrips: 6,
  totalDistanceKm: 248,
  totalDurationMin: 372,
  avgScore: 87,
  bestScore: 92,
  worstScore: 82,
  period: "Last 7 days",
  periodStart: "2025-03-09",
  periodEnd: "2025-03-15",
  recentTrips: [
    { id: "st1", date: "2025-03-12", distanceKm: 45, durationMin: 62, startLocation: "San Francisco, CA", endLocation: "SFO Airport", score: 88 },
    { id: "st2", date: "2025-03-11", distanceKm: 23, durationMin: 35, startLocation: "Oakland", endLocation: "Downtown SF", score: 92 },
    { id: "st3", date: "2025-03-10", distanceKm: 78, durationMin: 95, startLocation: "San Jose", endLocation: "Palo Alto", score: 85 },
    { id: "st4", date: "2025-03-09", distanceKm: 12, durationMin: 18, startLocation: "Mission District", endLocation: "SOMA", score: 90 },
  ],
};
const sampleDrivingReportMonth = {
  totalTrips: 24,
  totalDistanceKm: 992,
  totalDurationMin: 1488,
  avgScore: 86,
  bestScore: 94,
  worstScore: 78,
  period: "Last 30 days",
  periodStart: "2025-02-14",
  periodEnd: "2025-03-15",
  recentTrips: [
    { id: "st1", date: "2025-03-12", distanceKm: 45, durationMin: 62, startLocation: "San Francisco, CA", endLocation: "SFO Airport", score: 88 },
    { id: "st2", date: "2025-03-11", distanceKm: 23, durationMin: 35, startLocation: "Oakland", endLocation: "Downtown SF", score: 92 },
    { id: "st3", date: "2025-03-10", distanceKm: 78, durationMin: 95, startLocation: "San Jose", endLocation: "Palo Alto", score: 85 },
    { id: "st4", date: "2025-03-09", distanceKm: 12, durationMin: 18, startLocation: "Mission District", endLocation: "SOMA", score: 90 },
    { id: "st5", date: "2025-03-08", distanceKm: 56, durationMin: 72, startLocation: "SFO Airport", endLocation: "Berkeley", score: 82 },
  ],
};

app.get("/api/driver/driving-reports", async (req, res) => {
  const driverId = getDriverId(req);
  const period = req.query.period || "month"; // week | month
  try {
    if (!isDbConnected()) {
      return res.json(period === "week" ? sampleDrivingReportWeek : sampleDrivingReportMonth);
    }
    await ensureDriverSeed();
    const since = new Date();
    if (period === "week") since.setDate(since.getDate() - 7);
    else since.setMonth(since.getMonth() - 1);
    const periodStart = since.toISOString().slice(0, 10);
    const periodEnd = new Date().toISOString().slice(0, 10);
    const trips = await Trip.find({ driverId, date: { $gte: periodStart } }).sort({ date: -1 }).limit(50).lean();
    const totalKm = trips.reduce((a, t) => a + (t.distanceKm || 0), 0);
    const totalDuration = trips.reduce((a, t) => a + (t.durationMin || 0), 0);
    const scores = trips.map((t) => t.score ?? 0).filter((s) => s > 0);
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const bestScore = scores.length ? Math.max(...scores) : 0;
    const worstScore = scores.length ? Math.min(...scores) : 0;
    const recentTrips = trips.slice(0, 10).map((t) => ({
      id: t._id?.toString(),
      date: t.date,
      distanceKm: t.distanceKm,
      durationMin: t.durationMin,
      startLocation: t.startLocation || "",
      endLocation: t.endLocation || "",
      score: t.score ?? 0,
    }));
    res.json({
      totalTrips: trips.length,
      totalDistanceKm: Math.round(totalKm * 10) / 10,
      totalDurationMin: totalDuration,
      avgScore,
      bestScore,
      worstScore,
      period: period === "week" ? "Last 7 days" : "Last 30 days",
      periodStart,
      periodEnd,
      recentTrips,
    });
  } catch (err) {
    console.error("Driving reports error:", err);
    return res.json(period === "week" ? sampleDrivingReportWeek : sampleDrivingReportMonth);
  }
});

app.get("/api/driver/service-history", async (req, res) => {
  const driverId = getDriverId(req);
  try {
    if (!isDbConnected()) {
      return res.json([
        { date: "2025-03-15", type: "Oil Change", description: "Regular oil and filter", status: "completed", cost: 85 },
        { date: "2025-02-10", type: "Tire Rotation", description: "Rotate and balance", status: "completed", cost: 60 },
        { date: "2025-01-05", type: "Brake Inspection", description: "Brake pad check", status: "completed", cost: 0 },
      ]);
    }
    await ensureDriverSeed();
    const docs = await NextService.find({ driverId }).sort({ date: -1 }).limit(10).lean();
    let history = docs.map((n) => ({
      date: n.date,
      type: n.type,
      description: n.description || "",
      status: "completed",
      cost: null,
    }));
    if (history.length === 0) {
      history = [
        { date: "2025-04-20", type: "Oil Change", description: "Scheduled oil change and filter replacement.", status: "scheduled", cost: null },
      ];
    }
    res.json(history);
  } catch (err) {
    console.error("Service history error:", err);
    return res.json([
      { date: "2025-03-15", type: "Oil Change", description: "Regular oil and filter", status: "completed", cost: 85 },
      { date: "2025-02-10", type: "Tire Rotation", description: "Rotate and balance", status: "completed", cost: 60 },
      { date: "2025-01-05", type: "Brake Inspection", description: "Brake pad check", status: "completed", cost: 0 },
    ]);
  }
});

// ---------- Driver: Predictive maintenance alerts ----------
const samplePredictiveAlerts = [
  { id: "pm-1", type: "oil_change", component: "Engine", title: "Oil change due", description: "Based on mileage and driving conditions, oil change recommended within 30 days or 1,200 km.", severity: "high", dueDate: "2025-04-20", dueKm: 24000, status: "pending", predictedDate: "2025-04-15" },
  { id: "pm-2", type: "brake_inspection", component: "Brakes", title: "Brake pad wear", description: "Front brake pads at ~65% life. Schedule inspection at next service.", severity: "medium", dueDate: "2025-05-01", dueKm: 26000, status: "pending", predictedDate: "2025-04-28" },
  { id: "pm-3", type: "tire_rotation", component: "Tires", title: "Tire rotation recommended", description: "Rotate tires to extend life and ensure even wear.", severity: "low", dueDate: "2025-05-15", dueKm: 25000, status: "pending", predictedDate: "2025-05-10" },
  { id: "pm-4", type: "battery_check", component: "Battery", title: "Battery health check", description: "Battery age suggests a health test at next visit.", severity: "low", dueDate: "2025-06-01", dueKm: null, status: "pending", predictedDate: "2025-05-25" },
];

const sampleUpcomingServices = [
  { date: "2025-04-20", type: "Oil Change", description: "Scheduled oil change and filter replacement at preferred service center.", status: "scheduled" },
  { date: "2025-05-15", type: "Tire Rotation", description: "Rotate tires and balance.", status: "scheduled" },
];

app.get("/api/driver/predictive-maintenance", async (req, res) => {
  const driverId = getDriverId(req);
  try {
    let vehicle = { make: "Toyota", model: "Camry 2024", healthScore: 87 };
    let upcomingServices = sampleUpcomingServices;
    if (isDbConnected()) {
      await ensureDriverSeed();
      const [vehicleHealth, nextServices] = await Promise.all([
        VehicleHealth.findOne({ driverId }).lean(),
        NextService.find({ driverId }).sort({ date: 1 }).limit(5).lean(),
      ]);
      if (vehicleHealth?.vehicle) {
        vehicle = {
          make: vehicleHealth.vehicle.make || "Toyota",
          model: vehicleHealth.vehicle.model || "Camry 2024",
          healthScore: vehicleHealth.vehicle.healthScore ?? 87,
        };
      }
      if (nextServices?.length) {
        upcomingServices = nextServices.map((n) => ({
          date: n.date,
          type: n.type,
          description: n.description || "",
          status: "scheduled",
        }));
      }
    }
    const alerts = samplePredictiveAlerts;
    const criticalCount = alerts.filter((a) => a.severity === "high").length;
    const warningCount = alerts.filter((a) => a.severity === "medium").length;
    return res.json({
      vehicle,
      alerts,
      upcomingServices,
      summary: { totalAlerts: alerts.length, criticalCount, warningCount },
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Predictive maintenance error:", err);
    return res.json({
      vehicle: { make: "Toyota", model: "Camry 2024", healthScore: 87 },
      alerts: samplePredictiveAlerts,
      upcomingServices: sampleUpcomingServices,
      summary: { totalAlerts: samplePredictiveAlerts.length, criticalCount: 1, warningCount: 1 },
      lastUpdated: new Date().toISOString(),
    });
  }
});

// ---------- Driver: Fuel efficiency & carbon tracker ----------
const fallbackWeather = { temp: 18, description: "Clear", code: 0 };
const KM_PER_LITER_PETROL = 12;
const sampleRefuelLog = [
  { id: "rf-1", date: "2025-03-10", amountLiters: 42, cost: 168, odometerKm: 18200, fuelType: "Gasoline" },
  { id: "rf-2", date: "2025-02-28", amountLiters: 38, cost: 152, odometerKm: 17700, fuelType: "Gasoline" },
  { id: "rf-3", date: "2025-02-15", amountLiters: 45, cost: 180, odometerKm: 17100, fuelType: "Gasoline" },
];

app.get("/api/driver/fuel-carbon", async (req, res) => {
  const driverId = getDriverId(req);
  const lat = Number(req.query.lat) || 37.77;
  const lng = Number(req.query.lng) || -122.41;
  try {
    let weather = fallbackWeather;
    try {
      weather = await getWeather(lat, lng);
    } catch (e) {
      console.warn("Weather fetch failed:", e.message);
    }
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    let totalDistanceKm = 0;
    let totalTrips = 0;
    if (isDbConnected()) {
      await ensureDriverSeed();
      const trips = await Trip.find({ driverId, date: { $gte: monthStart } }).lean();
      totalDistanceKm = trips.reduce((a, t) => a + (t.distanceKm || 0), 0);
      totalTrips = trips.length;
    }
    if (totalDistanceKm === 0) {
      totalDistanceKm = 428;
      totalTrips = 12;
    }
    const estimatedLiters = totalDistanceKm / KM_PER_LITER_PETROL;
    const avgKmPerL = Math.round(KM_PER_LITER_PETROL * 10) / 10;
    const petrolShare = 0.6;
    const dieselShare = 0.35;
    const electricShare = 0.05;
    const petrolKm = totalDistanceKm * petrolShare;
    const dieselKm = totalDistanceKm * dieselShare;
    const electricKm = totalDistanceKm * electricShare;
    const totalKgCO2 = Math.round(
      petrolKm * EMISSION_FACTORS.petrolPerKmKgCO2 +
      dieselKm * EMISSION_FACTORS.dieselPerKmKgCO2 +
      electricKm * EMISSION_FACTORS.electricPerKmKgCO2
    );
    const petrolKgCO2 = Math.round(petrolKm * EMISSION_FACTORS.petrolPerKmKgCO2);
    const dieselKgCO2 = Math.round(dieselKm * EMISSION_FACTORS.dieselPerKmKgCO2);
    const electricKgCO2 = Math.round(electricKm * EMISSION_FACTORS.electricPerKmKgCO2);
    const period = now.toLocaleString("default", { month: "long", year: "numeric" });
    return res.json({
      weather: { temp: weather.temp, description: weather.description, code: weather.code },
      fuelEfficiency: {
        totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
        estimatedLiters: Math.round(estimatedLiters * 10) / 10,
        avgKmPerL,
        totalTrips,
        period,
      },
      carbon: {
        totalKgCO2,
        petrolKgCO2,
        dieselKgCO2,
        electricKgCO2,
        totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
        period,
        factors: EMISSION_FACTORS,
      },
      refuelLog: sampleRefuelLog,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Fuel-carbon error:", err);
    const totalDistanceKm = 428;
    const estimatedLiters = totalDistanceKm / KM_PER_LITER_PETROL;
    return res.json({
      weather: fallbackWeather,
      fuelEfficiency: {
        totalDistanceKm: 428,
        estimatedLiters: Math.round(estimatedLiters * 10) / 10,
        avgKmPerL: KM_PER_LITER_PETROL,
        totalTrips: 12,
        period: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
      },
      carbon: {
        totalKgCO2: Math.round(totalDistanceKm * 0.6 * EMISSION_FACTORS.petrolPerKmKgCO2 + totalDistanceKm * 0.35 * EMISSION_FACTORS.dieselPerKmKgCO2 + totalDistanceKm * 0.05 * EMISSION_FACTORS.electricPerKmKgCO2),
        petrolKgCO2: Math.round(totalDistanceKm * 0.6 * EMISSION_FACTORS.petrolPerKmKgCO2),
        dieselKgCO2: Math.round(totalDistanceKm * 0.35 * EMISSION_FACTORS.dieselPerKmKgCO2),
        electricKgCO2: Math.round(totalDistanceKm * 0.05 * EMISSION_FACTORS.electricPerKmKgCO2),
        totalDistanceKm: 428,
        period: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
        factors: EMISSION_FACTORS,
      },
      refuelLog: sampleRefuelLog,
      lastUpdated: new Date().toISOString(),
    });
  }
});

// ---------- Insurance dashboard APIs ----------
app.get("/api/insurance/portfolio", async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json({
        activePolicies: 1,
        totalPremium: 1240,
        riskExposure: 72,
        openClaims: 0,
        lossRatio: 0.12,
      });
    }
    await ensureDriverSeed();
    const policies = await Insurance.find().lean();
    const scores = await MobilityScore.find().lean();
    const totalPremium = policies.reduce((a, p) => a + (p.premium || 0), 0);
    const avgRisk = scores.length ? Math.round(100 - scores.reduce((a, s) => a + (s.overall || 0), 0) / scores.length) : 25;
    let claimsCount = 0;
    try {
      const claims = await getClaimsList();
      claimsCount = claims.filter((c) => c.status !== "paid").length;
    } catch {
      claimsCount = 0;
    }
    res.json({
      activePolicies: policies.length || 1,
      totalPremium: totalPremium || 1240,
      riskExposure: avgRisk,
      openClaims: claimsCount,
      lossRatio: 0.12,
    });
  } catch (err) {
    console.error("Insurance portfolio error:", err);
    res.status(500).json({ error: "Portfolio unavailable" });
  }
});

function getClaimsList() {
  return Promise.resolve([
    { id: "CLM-001", driverId: "driver1", date: "2025-03-10", amount: 1200, status: "assessing", description: "Rear bumper" },
    { id: "CLM-002", driverId: "driver1", date: "2025-02-28", amount: 0, status: "paid", description: "Windshield" },
  ]);
}

// ---------- Driver: Claims upload & AI damage assessment ----------
const driverClaimsInMemory = [];

function buildStatusTimeline(claim) {
  const status = (claim.status || "submitted").toLowerCase();
  const submittedDate = claim.date || new Date().toISOString().slice(0, 10);
  const timeline = [
    { step: "submitted", label: "Submitted", date: submittedDate, completed: true },
    { step: "under_review", label: "Under review", date: status !== "submitted" ? submittedDate : null, completed: status !== "submitted" },
    { step: "assessing", label: "Assessment", date: status === "assessing" || status === "approved" || status === "paid" || status === "rejected" ? submittedDate : null, completed: ["assessing", "approved", "paid", "rejected"].includes(status) },
    { step: "resolved", label: status === "paid" ? "Paid" : status === "rejected" ? "Closed" : status === "approved" ? "Approved" : "Pending", date: ["paid", "rejected", "approved"].includes(status) ? submittedDate : null, completed: ["paid", "rejected", "approved"].includes(status) },
  ];
  return timeline;
}

app.get("/api/driver/claims", async (req, res) => {
  const driverId = getDriverId(req);
  try {
    const list = await getClaimsList();
    const filtered = list.filter((c) => c.driverId === driverId);
    const all = [...driverClaimsInMemory.filter((c) => c.driverId === driverId), ...filtered];
    all.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    const enriched = all.map((c) => ({ ...c, statusTimeline: buildStatusTimeline(c) }));
    return res.json(enriched);
  } catch (err) {
    console.error("Driver claims error:", err);
    const fallback = driverClaimsInMemory.filter((c) => c.driverId === getDriverId(req));
    return res.json(fallback.map((c) => ({ ...c, statusTimeline: buildStatusTimeline(c) })));
  }
});

app.post("/api/driver/claims/assess", (req, res) => {
  try {
    const { imageBase64, description } = req.body || {};
    const desc = (description || "Vehicle damage").toString().toLowerCase();
    const hasRear = desc.includes("rear") || desc.includes("bumper") || desc.includes("back");
    const hasFront = desc.includes("front") || desc.includes("hood") || desc.includes("fender");
    const hasSide = desc.includes("side") || desc.includes("door");
    const hasGlass = desc.includes("windshield") || desc.includes("glass");
    let damageType = "Body damage";
    let estimatedCost = 850;
    const affectedParts = [];
    if (hasGlass) {
      damageType = "Windshield / glass";
      estimatedCost = 320;
      affectedParts.push("Windshield");
    } else if (hasRear && hasFront) {
      damageType = "Multi-panel damage";
      estimatedCost = 2100;
      affectedParts.push("Rear bumper", "Front bumper", "Paint");
    } else if (hasRear) {
      damageType = "Rear damage";
      estimatedCost = 950;
      affectedParts.push("Rear bumper", "Paint");
    } else if (hasFront) {
      damageType = "Front damage";
      estimatedCost = 1200;
      affectedParts.push("Front bumper", "Grille");
    } else if (hasSide) {
      damageType = "Side damage";
      estimatedCost = 1100;
      affectedParts.push("Door panel", "Paint");
    }
    if (affectedParts.length === 0) affectedParts.push("Body panel", "Paint");
    const assessmentId = `ast-${Date.now()}`;
    return res.status(200).json({
      assessmentId,
      damageType,
      estimatedCost,
      affectedParts,
      severity: estimatedCost > 1500 ? "high" : estimatedCost > 700 ? "medium" : "low",
      confidence: 0.85,
      message: "AI assessment complete. Review and submit to file claim.",
    });
  } catch (err) {
    console.error("Claims assess error:", err);
    return res.status(200).json({
      assessmentId: `ast-${Date.now()}`,
      damageType: "Body damage",
      estimatedCost: 850,
      affectedParts: ["Body panel", "Paint"],
      severity: "medium",
      confidence: 0.75,
      message: "Assessment could not be completed. You can still submit with your description.",
    });
  }
});

app.post("/api/driver/claims", (req, res) => {
  try {
    const driverId = getDriverId(req);
    const { description, assessmentId, estimatedCost, damageType, affectedParts } = req.body || {};
    const id = `CLM-${Date.now().toString().slice(-6)}`;
    const date = new Date().toISOString().slice(0, 10);
    const claim = {
      id,
      driverId,
      date,
      amount: Number(estimatedCost) || 0,
      status: "submitted",
      description: (description || damageType || "Damage claim").toString().slice(0, 200),
      assessmentId: assessmentId || null,
      damageType: damageType || "General",
      affectedParts: Array.isArray(affectedParts) ? affectedParts : [],
    };
    driverClaimsInMemory.push(claim);
    return res.status(201).json({ success: true, claim });
  } catch (err) {
    console.error("Claims submit error:", err);
    return res.status(200).json({ success: false, error: "Submit failed", claim: null });
  }
});

app.get("/api/insurance/policies", async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json([
        { driverId: "driver1", provider: "State Farm", policyNumber: "POL-2024-45678", expiryDate: "2025-09-15", premium: 1240, coverage: "Comprehensive" },
      ]);
    }
    await ensureDriverSeed();
    const list = await Insurance.find().lean();
    res.json(list.map((p) => ({
      driverId: p.driverId,
      provider: p.provider || "",
      policyNumber: p.policyNumber || "",
      expiryDate: p.expiryDate || "",
      premium: p.premium ?? 0,
      coverage: p.coverage || "",
    })));
  } catch (err) {
    console.error("Insurance policies error:", err);
    res.status(500).json({ error: "Policies unavailable" });
  }
});

app.get("/api/insurance/claims", async (req, res) => {
  try {
    const list = await getClaimsList();
    res.json(list);
  } catch (err) {
    console.error("Insurance claims error:", err);
    res.status(500).json({ error: "Claims unavailable" });
  }
});

app.get("/api/insurance/drivers-risk", async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json([
        { driverId: "driver1", name: "Alex Rivera", riskScore: 14, mobilityScore: 86 },
      ]);
    }
    await ensureDriverSeed();
    const profiles = await Profile.find().lean();
    const scores = await MobilityScore.find().lean();
    const scoreByDriver = new Map(scores.map((s) => [s.driverId, s.overall ?? 0]));
    const list = profiles.map((p) => {
      const mobility = scoreByDriver.get(p.driverId) ?? 0;
      return {
        driverId: p.driverId,
        name: p.fullName || p.username || p.driverId,
        riskScore: Math.round(100 - mobility),
        mobilityScore: mobility,
      };
    });
    res.json(list);
  } catch (err) {
    console.error("Insurance drivers-risk error:", err);
    res.status(500).json({ error: "Drivers risk unavailable" });
  }
});

// ---------- Technician job queue (from fleet maintenance) ----------
app.get("/api/technician/jobs", async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json([
        { id: "1", vehiclePlate: "AB-1234", type: "Oil Change", status: "in_progress", priority: "medium", estimatedMinutes: 45 },
        { id: "2", vehiclePlate: "CD-5678", type: "Tire Rotation", status: "pending", priority: "low", estimatedMinutes: 30 },
      ]);
    }
    await ensureFleetExtendedSeed();
    const list = await FleetMaintenance.find().sort({ date: 1 }).lean();
    const jobs = list.map((m, i) => ({
      id: (m._id || `job-${i}`).toString(),
      vehiclePlate: m.vehiclePlate,
      type: m.type,
      status: m.status === "completed" ? "completed" : m.status === "scheduled" ? "pending" : "in_progress",
      priority: "medium",
      estimatedMinutes: 45,
      date: m.date,
      description: m.description,
    }));
    res.json(jobs);
  } catch (err) {
    console.error("Technician jobs error:", err);
    return res.status(200).json([
      { id: "1", vehiclePlate: "AB-1234", type: "Oil Change", status: "in_progress", priority: "medium", estimatedMinutes: 45 },
      { id: "2", vehiclePlate: "CD-5678", type: "Tire Rotation", status: "pending", priority: "low", estimatedMinutes: 30 },
    ]);
  }
});

// ---------- Driver: Assigned technician profile ----------
const sampleTechnician = {
  id: "tech-001",
  name: "Mike Chen",
  avatar: null,
  rating: 4.8,
  reviewCount: 120,
  skills: ["Brakes", "Engine", "Electrical", "Oil & Fluids"],
  certifications: ["ASE A1–A8", "EV Hybrid"],
  phone: "+1 (555) 234-5678",
  email: "mike.chen@autosphere.service",
  currentJobId: "1",
  currentJobType: "Oil Change",
  joinedAt: "2020-03-15",
};

function buildRepairSteps(jobStatus) {
  const status = (jobStatus || "in_progress").toLowerCase();
  const isCompleted = status === "completed";
  const isInProgress = status === "in_progress";
  return [
    { id: "diagnosis", name: "Diagnosis", status: isCompleted || isInProgress ? "done" : "pending", completedAt: isCompleted || isInProgress ? new Date().toISOString().slice(0, 16) : null },
    { id: "repair", name: "Repair", status: isCompleted ? "done" : isInProgress ? "active" : "pending", completedAt: isCompleted ? new Date().toISOString().slice(0, 16) : null },
    { id: "qc", name: "Quality check", status: isCompleted ? "done" : "pending", completedAt: isCompleted ? new Date().toISOString().slice(0, 16) : null },
  ];
}

function getProgressFromSteps(steps) {
  if (!steps || !steps.length) return 0;
  const done = steps.filter((s) => s.status === "done").length;
  const active = steps.some((s) => s.status === "active");
  const pct = Math.round((done / steps.length) * 100);
  return active ? Math.min(pct + 15, 95) : pct;
}

app.get("/api/driver/technician-profile", async (req, res) => {
  try {
    let jobs = [
      { id: "1", vehiclePlate: "AB-1234", type: "Oil Change", status: "in_progress" },
      { id: "2", vehiclePlate: "CD-5678", type: "Tire Rotation", status: "pending" },
    ];
    if (isDbConnected()) {
      try {
        await ensureFleetExtendedSeed();
        const list = await FleetMaintenance.find().sort({ date: -1 }).limit(5).lean();
        jobs = list.map((m, i) => ({
          id: (m._id || `job-${i}`).toString(),
          vehiclePlate: m.vehiclePlate,
          type: m.type,
          status: m.status === "completed" ? "completed" : m.status === "scheduled" ? "pending" : "in_progress",
        }));
      } catch (_) {}
    }
    const inProgress = jobs.find((j) => j.status === "in_progress");
    const payload = {
      ...sampleTechnician,
      currentJobId: inProgress?.id || sampleTechnician.currentJobId,
      currentJobType: inProgress?.type || sampleTechnician.currentJobType,
    };
    return res.json(payload);
  } catch (err) {
    console.error("Driver technician-profile error:", err);
    return res.status(200).json(sampleTechnician);
  }
});

// ---------- Driver: Live repair (current repair session) ----------
app.get("/api/driver/live-repair", async (req, res) => {
  try {
    const driverId = getDriverId(req);
    let jobs = [];
    try {
      if (isDbConnected()) {
        await ensureFleetExtendedSeed();
        const list = await FleetMaintenance.find().sort({ date: 1 }).lean();
        jobs = list.map((m, i) => ({
          id: (m._id || `job-${i}`).toString(),
          vehiclePlate: m.vehiclePlate,
          type: m.type,
          status: m.status === "completed" ? "completed" : m.status === "scheduled" ? "pending" : "in_progress",
          priority: "medium",
          estimatedMinutes: 45,
          date: m.date,
          description: m.description,
          cost: m.cost ?? null,
        }));
      }
    } catch (_) {}
    if (jobs.length === 0) {
      jobs = [
        { id: "1", vehiclePlate: "AB-1234", type: "Oil Change", status: "in_progress", estimatedMinutes: 45, date: new Date().toISOString().slice(0, 10), description: "Regular oil and filter change" },
        { id: "2", vehiclePlate: "CD-5678", type: "Tire Rotation", status: "pending", estimatedMinutes: 30, date: null, description: "Rotate tires and balance" },
      ];
    }
    const activeJob = jobs.find((j) => j.status === "in_progress");
    if (!activeJob) {
      return res.json({
        active: false,
        message: "No active repair",
        job: null,
        lastUpdated: new Date().toISOString(),
      });
    }
    const steps = buildRepairSteps(activeJob.status);
    const progressPercent = getProgressFromSteps(steps);
    const startedAt = activeJob.date ? `${activeJob.date}T09:00:00` : new Date().toISOString().slice(0, 16);
    const estimatedMin = activeJob.estimatedMinutes || 45;
    const estimatedCompletion = new Date(new Date(startedAt).getTime() + estimatedMin * 60 * 1000).toISOString().slice(0, 16);
    const lastUpdated = new Date().toISOString();
    const updates = [
      { id: "u1", at: lastUpdated, text: activeJob.status === "in_progress" ? "Technician is working on your vehicle." : "Job scheduled and queued." },
      { id: "u2", at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), text: "Diagnosis completed. Parts confirmed." },
    ];
    return res.json({
      active: true,
      job: {
        id: activeJob.id,
        vehiclePlate: activeJob.vehiclePlate,
        type: activeJob.type,
        status: activeJob.status,
        steps,
        estimatedMinutes: estimatedMin,
        startedAt,
        estimatedCompletion,
        description: activeJob.description || "",
        technicianName: sampleTechnician.name,
        technicianId: sampleTechnician.id,
        progressPercent,
        lastUpdated,
        updates,
        cost: activeJob.cost ?? null,
      },
      lastUpdated,
    });
  } catch (err) {
    console.error("Driver live-repair error:", err);
    const steps = buildRepairSteps("in_progress");
    const fallbackJob = {
      id: "1",
      vehiclePlate: "AB-1234",
      type: "Oil Change",
      status: "in_progress",
      steps,
      estimatedMinutes: 45,
      startedAt: new Date().toISOString().slice(0, 16),
      estimatedCompletion: new Date(Date.now() + 45 * 60 * 1000).toISOString().slice(0, 16),
      description: "Regular oil and filter change",
      technicianName: sampleTechnician.name,
      technicianId: sampleTechnician.id,
      progressPercent: getProgressFromSteps(steps),
      lastUpdated: new Date().toISOString(),
      updates: [
        { id: "u1", at: new Date().toISOString(), text: "Technician is working on your vehicle." },
        { id: "u2", at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), text: "Diagnosis completed." },
      ],
      cost: null,
    };
    return res.status(200).json({ active: true, job: fallbackJob, message: null, lastUpdated: fallbackJob.lastUpdated });
  }
});

// ---------- Property parking stats ----------
app.get("/api/property/parking-stats", async (req, res) => {
  try {
    const utilization = [78, 82, 75, 88, 85, 90];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const revenue = [4200, 4850, 5100, 4900, 5300, 5600];
    res.json({ months, utilization, revenue, currency: "USD", totalSlots: 120 });
  } catch (err) {
    res.status(500).json({ error: "Parking stats unavailable" });
  }
});

// ---------- Government: recall summary (uses NHTSA) ----------
app.get("/api/government/recalls-summary", async (req, res) => {
  try {
    const make = req.query.make || "Toyota";
    const year = Number(req.query.year) || 2024;
    const recalls = await getRecalls(make, "Camry", year);
    res.json({ make, year, totalRecalls: recalls.length, recalls: recalls.slice(0, 5) });
  } catch (err) {
    console.error("Recalls summary error:", err);
    res.status(502).json({ error: "Recalls unavailable" });
  }
});

// ---------- Dealer inventory (fleet vehicles as dealer stock — same source as /api/fleet/vehicles) ----------
app.get("/api/dealer/inventory", async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json(defaultFleetVehicles.map((v, i) => ({
        id: `mock-${i}`,
        make: (v.model || "").split(" ")[0] || "Vehicle",
        model: (v.model || "").replace(/^\w+\s/, "") || v.model || "—",
        year: 2024,
        price: 40000 + (i + 1) * 5000,
        status: v.status === "maintenance" ? "service" : "available",
        plateNumber: v.plateNumber,
      })));
    }
    await ensureFleetSeed();
    const list = await FleetVehicle.find().lean();
    const inventory = list.map((v, i) => ({
      id: (v._id || `inv-${i}`).toString(),
      make: (v.model || "").split(" ")[0] || "Vehicle",
      model: (v.model || "").replace(/^\w+\s/, "") || "—",
      year: 2024,
      price: 40000 + Math.floor(Math.random() * 20000),
      status: v.status === "maintenance" ? "service" : "available",
      plateNumber: v.plateNumber,
    }));
    res.json(inventory);
  } catch (err) {
    console.error("Dealer inventory error:", err);
    res.status(500).json({ error: "Inventory unavailable" });
  }
});

// ---------- Analytics: vehicle health trends ----------
app.get("/api/analytics/vehicle-health-trends", async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json({ months: ["Jan", "Feb", "Mar"], avgHealth: [85, 86, 87] });
    }
    await ensureDriverSeed();
    const docs = await VehicleHealth.find().lean();
    const avg = docs.length ? Math.round(docs.reduce((a, d) => a + (d.vehicle?.healthScore || 0), 0) / docs.length) : 0;
    res.json({ months: ["Jan", "Feb", "Mar"], avgHealth: [avg - 2, avg - 1, avg] });
  } catch (err) {
    res.status(500).json({ error: "Trends unavailable" });
  }
});

// ---------- Analytics: insurance risk trends ----------
app.get("/api/analytics/insurance-risk-trends", async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json({ months: ["Jan", "Feb", "Mar"], avgRiskScore: [28, 26, 25] });
    }
    const scores = await MobilityScore.find().lean();
    const avg = scores.length ? Math.round(100 - scores.reduce((a, s) => a + (s.overall || 0), 0) / scores.length) : 25;
    res.json({ months: ["Jan", "Feb", "Mar"], avgRiskScore: [avg + 2, avg + 1, avg] });
  } catch (err) {
    res.status(500).json({ error: "Trends unavailable" });
  }
});

// 404: return JSON so frontend never gets HTML
app.use((req, res) => {
  res.status(404).json({ error: "Not found", path: req.path });
});

// Global error handler: ensure all errors return JSON (no HTML)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("AutoSphere Backend running on port " + PORT);
});
