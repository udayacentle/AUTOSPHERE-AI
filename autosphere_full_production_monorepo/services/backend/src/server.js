import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import crypto from "node:crypto";
import mongoose from "mongoose";
import connectDB from "./db/connectDB.js";
import Profile from "./models/Profile.js";
import Trip from "./models/Trip.js";
import VehicleHealth from "./models/VehicleHealth.js";
import Insurance from "./models/Insurance.js";
import InsuranceClaim from "./models/InsuranceClaim.js";
import MobilityScore from "./models/MobilityScore.js";
import NextService from "./models/NextService.js";
import FleetVehicle from "./models/FleetVehicle.js";
import FleetDriver from "./models/FleetDriver.js";
import FleetMaintenance from "./models/FleetMaintenance.js";
import FleetReport from "./models/FleetReport.js";
import FleetOrganization from "./models/FleetOrganization.js";
import FleetRole from "./models/FleetRole.js";
import FleetUser from "./models/FleetUser.js";
import FleetActivityLog from "./models/FleetActivityLog.js";
import FleetFuelLog from "./models/FleetFuelLog.js";
import FleetAlert from "./models/FleetAlert.js";
import VehicleDiagnosticTwin from "./models/VehicleDiagnosticTwin.js";
import TechnicianProfile from "./models/TechnicianProfile.js";
import TechnicianJobExtra from "./models/TechnicianJobExtra.js";
import TechnicianStats from "./models/TechnicianStats.js";
import { getWeather, getRecalls, REAL_SERVICE_CENTERS, EMISSION_FACTORS } from "./services/realWorldApis.js";

dotenv.config();

connectDB();

// When MongoDB connects, run all seed functions so sample data exists (avoids "not found" on first load)
async function runStartupSeed() {
  if (!isDbConnected()) return;
  try {
    await ensureFleetExtendedSeed();
    await ensureDiagnosticTwinSeed();
    await ensureTechnicianSeed();
    console.log("Startup seed: sample data ready (fleet, diagnostic twin, technician).");
  } catch (err) {
    console.error("Startup seed error:", err);
  }
}
mongoose.connection.once("open", runStartupSeed);

const app = express();

app.use(cors({ origin: true }));
app.use(bodyParser.json());

const SECRET = process.env.JWT_SECRET || "AUTOSPHERE_SECRET";
const DEFAULT_DRIVER_ID = "driver1";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/auth/google/callback";
const googleOauthStates = new Set();

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

// Demo Google login endpoint. Replace with OAuth flow in production.
app.post("/auth/google", (req, res) => {
  try {
    const email = (req.body?.email || DEMO_EMAIL).toString().trim().toLowerCase();
    const token = jwt.sign({ email, provider: "google" }, SECRET, { expiresIn: "1h" });
    res.json({ token, email, provider: "google" });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ message: "Google login failed. Please try again." });
  }
});

// Real Google OAuth (account chooser)
app.get("/auth/google/start", (req, res) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.redirect(
      `${FRONTEND_ORIGIN}/auth/login?google_error=${encodeURIComponent("Google OAuth is not configured on server.")}`
    );
  }
  const state = crypto.randomBytes(24).toString("hex");
  googleOauthStates.add(state);
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    include_granted_scopes: "true",
    prompt: "select_account",
    state,
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

app.get("/auth/google/callback", async (req, res) => {
  try {
    const code = String(req.query.code || "");
    const state = String(req.query.state || "");
    if (!code || !state || !googleOauthStates.has(state)) {
      return res.redirect(
        `${FRONTEND_ORIGIN}/auth/login?google_error=${encodeURIComponent("Invalid Google sign-in state.")}`
      );
    }
    googleOauthStates.delete(state);

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) {
      return res.redirect(
        `${FRONTEND_ORIGIN}/auth/login?google_error=${encodeURIComponent("Failed to exchange Google auth code.")}`
      );
    }
    const tokenJson = await tokenRes.json();
    const accessToken = tokenJson?.access_token ? String(tokenJson.access_token) : "";
    if (!accessToken) {
      return res.redirect(
        `${FRONTEND_ORIGIN}/auth/login?google_error=${encodeURIComponent("Google access token was not returned.")}`
      );
    }

    const profileRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!profileRes.ok) {
      return res.redirect(
        `${FRONTEND_ORIGIN}/auth/login?google_error=${encodeURIComponent("Failed to fetch Google profile.")}`
      );
    }
    const profile = await profileRes.json();
    const email = String(profile?.email || "").trim().toLowerCase();
    if (!email) {
      return res.redirect(
        `${FRONTEND_ORIGIN}/auth/login?google_error=${encodeURIComponent("Google account email not available.")}`
      );
    }

    const appToken = jwt.sign({ email, provider: "google" }, SECRET, { expiresIn: "1h" });
    return res.redirect(
      `${FRONTEND_ORIGIN}/auth/login?google_token=${encodeURIComponent(appToken)}&google_email=${encodeURIComponent(email)}`
    );
  } catch (err) {
    console.error("Google callback error:", err);
    return res.redirect(
      `${FRONTEND_ORIGIN}/auth/login?google_error=${encodeURIComponent("Google login failed. Please try again.")}`
    );
  }
});

app.get("/vehicles/1", (req, res) => {
  res.json({ mobilityScore: 870 });
});

// Real-world seed data: cities (US/India), real car models, real insurance brands
const sampleTripsForSeed = [
  { driverId: DEFAULT_DRIVER_ID, passengerId: "user-passenger-1", date: "2025-03-12", distanceKm: 45, durationMin: 62, startLocation: "San Francisco, CA", endLocation: "SFO Airport", score: 88, status: "completed" },
  { driverId: DEFAULT_DRIVER_ID, passengerId: "user-passenger-2", date: "2025-03-11", distanceKm: 23, durationMin: 35, startLocation: "Oakland", endLocation: "Downtown SF", score: 92, status: "completed" },
  { driverId: "user-driver-1", passengerId: "user-passenger-1", date: "2025-03-10", distanceKm: 78, durationMin: 95, startLocation: "San Jose", endLocation: "Palo Alto", score: 85, status: "completed" },
  { driverId: "user-driver-2", passengerId: null, date: "2025-03-15", distanceKm: 0, durationMin: 0, startLocation: "Downtown SF", endLocation: "SFO Airport", score: 0, status: "in_progress" },
  { driverId: null, passengerId: "user-passenger-2", date: "2025-03-16", distanceKm: 0, durationMin: 0, startLocation: "Berkeley", endLocation: "Oakland", score: 0, status: "pending" },
  { driverId: "user-driver-1", passengerId: "user-passenger-1", date: "2025-03-09", distanceKm: 12, durationMin: 18, startLocation: "Mission District", endLocation: "SOMA", score: 90, status: "completed" },
  { driverId: "user-driver-2", passengerId: "user-passenger-2", date: "2025-03-08", distanceKm: 56, durationMin: 72, startLocation: "SFO Airport", endLocation: "Berkeley", score: 82, status: "completed" },
  { driverId: null, passengerId: "user-passenger-1", date: "2025-03-17", distanceKm: 0, durationMin: 0, startLocation: "Palo Alto", endLocation: "San Jose", score: 0, status: "pending" },
  { driverId: "user-driver-1", passengerId: "user-passenger-2", date: "2025-03-18", distanceKm: 0, durationMin: 0, startLocation: "Hayward", endLocation: "Fremont", score: 0, status: "assigned" },
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

const fleetActivityMemory = [];
async function logFleetActivity(entry) {
  const row = {
    action: entry.action || "event",
    summary: entry.summary || "",
    actorUserId: entry.actorUserId || "",
    targetType: entry.targetType || "",
    targetId: entry.targetId || "",
    meta: entry.meta && typeof entry.meta === "object" ? entry.meta : {},
    organizationId: entry.organizationId || null,
  };
  if (!isDbConnected()) {
    fleetActivityMemory.unshift({
      _id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...row,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    while (fleetActivityMemory.length > 150) fleetActivityMemory.pop();
    return;
  }
  try {
    await FleetActivityLog.create(row);
  } catch (e) {
    console.error("Fleet activity log error:", e);
  }
}

const defaultFleetActivitySamples = [
  { action: "trip_booked", summary: "Passenger booked ride Berkeley → Oakland", actorUserId: "user-passenger-2", targetType: "trip", targetId: "seed-1" },
  { action: "trip_assigned", summary: "Trip assigned to driver user-driver-1", actorUserId: "user-entity-1", targetType: "trip", targetId: "seed-2" },
  { action: "user_role_changed", summary: "Guest role reviewed (compliance)", actorUserId: "user-super-1", targetType: "user", targetId: "user-guest-1", meta: { roleSlug: "guest" } },
  { action: "trip_status", summary: "Trip marked completed", actorUserId: "user-driver-1", targetType: "trip", targetId: "seed-3" },
];

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
  { vehiclePlate: "AB-1234", type: "Air Filter Replacement", date: "2025-03-18", description: "Cabin and engine air filter", status: "in_progress", cost: null },
  { vehiclePlate: "CD-5678", type: "Battery Test", date: "2025-03-22", description: "Load test and charging system check", status: "pending", cost: null },
];
const defaultFleetReports = [
  { period: "March 2025", totalTrips: 120, totalDistanceKm: 2450, totalFuelUsed: 320, maintenanceCount: 5, alerts: 2 },
  { period: "February 2025", totalTrips: 98, totalDistanceKm: 2100, totalFuelUsed: 280, maintenanceCount: 3, alerts: 0 },
];

const defaultFleetFuelLogs = [
  {
    vehiclePlate: "AB-1234",
    date: "2025-03-15",
    liters: 52,
    pricePerLiter: 1.45,
    totalCost: 75.4,
    odometerKm: 42150,
    fuelType: "diesel",
    station: "Shell Downtown",
    recordedBy: "user-entity-1",
  },
  {
    vehiclePlate: "CD-5678",
    date: "2025-03-13",
    liters: 47,
    pricePerLiter: 1.44,
    totalCost: 67.68,
    odometerKm: 50880,
    fuelType: "diesel",
    station: "City Fuel Point",
    recordedBy: "user-entity-1",
  },
  {
    vehiclePlate: "AB-1234",
    date: "2025-03-08",
    liters: 48,
    pricePerLiter: 1.43,
    totalCost: 68.64,
    odometerKm: 41760,
    fuelType: "diesel",
    station: "Metro Pumps",
    recordedBy: "user-entity-1",
  },
];

const defaultFleetAlerts = [
  {
    type: "speed_violation",
    severity: "high",
    vehiclePlate: "AB-1234",
    driverId: "user-driver-1",
    message: "Speed exceeded 90 km/h in downtown zone.",
    status: "open",
    source: "gps",
  },
  {
    type: "maintenance_due",
    severity: "medium",
    vehiclePlate: "CD-5678",
    driverId: "user-driver-2",
    message: "Service reminder: brake inspection due in 3 days.",
    status: "open",
    source: "maintenance",
  },
  {
    type: "geofence",
    severity: "low",
    vehiclePlate: "EF-9012",
    driverId: "",
    message: "Vehicle exited designated service area.",
    status: "resolved",
    source: "gps",
  },
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

// BRD: Fleet Management System – Role & Permission (Driver, Passenger, Entity Admin, Super Admin, Guest User)
const defaultFleetRoles = [
  { name: "Driver", slug: "driver", description: "View assigned trips; accept/reject trips; update trip status (Start, In Progress, Completed); access navigation. No access to management or reports.", permissions: ["view_vehicles:limited", "update_trip_status", "manage_trips:assigned"] },
  { name: "Passenger", slug: "passenger", description: "Book or schedule rides; track trips; view trip history; access basic billing. Limited to own data.", permissions: ["view_vehicles:limited", "book_ride", "manage_trips:own", "billing:limited"] },
  { name: "Entity Admin", slug: "entity_admin", description: "Manage vehicles, drivers, passengers; assign and monitor trips; access reports and analytics; view billing. Limited to one organization.", permissions: ["view_vehicles:full", "book_ride", "manage_trips:full", "update_trip_status", "manage_vehicles", "manage_users", "reports_analytics", "billing:full", "system_config:limited"] },
  { name: "Super Admin", slug: "super_admin", description: "Full system control; manage all organizations; configure system settings; access all reports; manage roles and permissions.", permissions: ["view_vehicles:full", "book_ride", "manage_trips:full", "update_trip_status", "manage_vehicles", "manage_users", "reports_analytics", "billing:full", "system_config:full", "multi_organization"] },
  { name: "Guest User", slug: "guest", description: "View limited public information. No booking or management access.", permissions: ["view_vehicles:limited"] },
];

// BRD Section 4: Permissions Matrix (Feature -> Role -> Access)
const permissionsMatrix = {
  roles: ["Driver", "Passenger", "Entity Admin", "Super Admin", "Guest User"],
  features: [
    { id: "view_vehicles", name: "View Vehicles", driver: "Limited", passenger: "Limited", entity_admin: "Full", super_admin: "Full", guest: "Limited" },
    { id: "book_ride", name: "Book Ride", driver: "No", passenger: "Yes", entity_admin: "Yes", super_admin: "Yes", guest: "No" },
    { id: "manage_trips", name: "Manage Trips", driver: "Assigned", passenger: "Own", entity_admin: "Full", super_admin: "Full", guest: "No" },
    { id: "update_trip_status", name: "Update Trip Status", driver: "Yes", passenger: "No", entity_admin: "Yes", super_admin: "Yes", guest: "No" },
    { id: "manage_vehicles", name: "Manage Vehicles", driver: "No", passenger: "No", entity_admin: "Yes", super_admin: "Yes", guest: "No" },
    { id: "manage_users", name: "Manage Users", driver: "No", passenger: "No", entity_admin: "Yes", super_admin: "Yes", guest: "No" },
    { id: "reports_analytics", name: "Reports & Analytics", driver: "No", passenger: "No", entity_admin: "Yes", super_admin: "Yes", guest: "No" },
    { id: "billing_access", name: "Billing Access", driver: "No", passenger: "Limited", entity_admin: "Yes", super_admin: "Yes", guest: "No" },
    { id: "system_config", name: "System Configuration", driver: "No", passenger: "No", entity_admin: "Limited", super_admin: "Full", guest: "No" },
    { id: "multi_organization", name: "Multi-Organization", driver: "No", passenger: "No", entity_admin: "No", super_admin: "Yes", guest: "No" },
  ],
  principles: ["Least Privilege: Users only get required access", "Role Hierarchy: Super Admin > Entity Admin > Others", "Data Isolation: Users access only relevant data"],
};

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
  const fuelCount = await FleetFuelLog.countDocuments();
  if (fuelCount === 0) {
    await FleetFuelLog.insertMany(defaultFleetFuelLogs);
    console.log("Fleet: seeded fuel logs.");
  }
  const alertCount = await FleetAlert.countDocuments();
  if (alertCount === 0) {
    await FleetAlert.insertMany(defaultFleetAlerts);
    console.log("Fleet: seeded alerts.");
  }
}

const defaultFleetUsers = [
  { userId: "user-super-1", email: "admin@autosphere.ai", fullName: "System Super Admin", roleSlug: "super_admin", status: "active" },
  { userId: "user-entity-1", email: "fleet.admin@autosphere-west.com", fullName: "Jane Fleet Admin", roleSlug: "entity_admin", status: "active" },
  { userId: "user-driver-1", email: "james.w@fleet.com", fullName: "James Wilson", roleSlug: "driver", status: "active" },
  { userId: "user-driver-2", email: "maria.s@fleet.com", fullName: "Maria Santos", roleSlug: "driver", status: "active" },
  { userId: "user-passenger-1", email: "passenger1@example.com", fullName: "Alex Rider", roleSlug: "passenger", status: "active" },
  { userId: "user-passenger-2", email: "passenger2@example.com", fullName: "Sam Carter", roleSlug: "passenger", status: "active" },
  { userId: "user-guest-1", email: "guest@example.com", fullName: "Guest Viewer", roleSlug: "guest", status: "active" },
];

async function ensureFleetAdminSeed() {
  if (!isDbConnected()) return;
  if ((await FleetOrganization.countDocuments()) === 0) {
    await FleetOrganization.insertMany(defaultFleetOrganizations);
    console.log("Fleet: seeded organizations.");
  }
  if ((await FleetRole.countDocuments()) === 0) {
    await FleetRole.insertMany(defaultFleetRoles);
    console.log("Fleet: seeded roles (BRD).");
  }
  if ((await FleetUser.countDocuments()) === 0) {
    const firstOrg = await FleetOrganization.findOne().lean();
    const orgId = firstOrg ? firstOrg._id : null;
    const usersToInsert = defaultFleetUsers.map((u, i) => ({
      ...u,
      organizationId: i === 0 ? null : orgId,
    }));
    await FleetUser.insertMany(usersToInsert);
    console.log("Fleet: seeded users (BRD roles).");
  }
}

function mapFleetVehicleToPublic(v) {
  return {
    plateNumber: (v.plateNumber || "").trim(),
    model: v.model || "",
    availability: v.status === "active" ? "Available" : "Limited",
  };
}

/** BRD passenger billing: lines derived from trip history (fare model: base + per-km). */
function buildPassengerBillingPayload(passengerId, tripDocs) {
  const base = 5.5;
  const perKm = 1.75;
  const defaultEstKm = 18;
  const trips = [...tripDocs].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const lines = [];
  let balanceDue = 0;
  for (const t of trips) {
    const id = t._id?.toString?.() || t.id || `line-${lines.length}`;
    const desc = `${t.startLocation || "—"} → ${t.endLocation || "—"}`;
    if (t.status === "rejected") {
      lines.push({ id, date: t.date, description: desc, amount: 0, status: "cancelled" });
      continue;
    }
    const km = Number(t.distanceKm || 0);
    if (t.status === "completed") {
      const amount = Math.round((base + km * perKm) * 100) / 100;
      lines.push({ id, date: t.date, description: desc, amount, status: "paid" });
      continue;
    }
    const estKm = km > 0 ? km : defaultEstKm;
    const amount = Math.round((base + estKm * perKm) * 100) / 100;
    lines.push({
      id,
      date: t.date,
      description: `${desc} (estimated)`,
      amount,
      status: "pending",
    });
    balanceDue += amount;
  }
  return {
    passengerId,
    currency: "USD",
    lines,
    balanceDue: Math.round(balanceDue * 100) / 100,
    lastInvoiceUrl: `/api/fleet/billing/passenger?passengerId=${encodeURIComponent(passengerId)}`,
  };
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

app.post("/api/fleet/maintenance", async (req, res) => {
  const b = req.body || {};
  const payload = {
    vehiclePlate: String(b.vehiclePlate || "").trim(),
    type: String(b.type || "Service"),
    date: String(b.date || new Date().toISOString().slice(0, 10)),
    description: String(b.description || ""),
    status: String(b.status || "scheduled"),
    cost: b.cost != null && b.cost !== "" ? Number(b.cost) : null,
  };
  if (!payload.vehiclePlate) {
    return res.status(400).json({ message: "vehiclePlate is required." });
  }
  if (!isDbConnected()) {
    return res.status(503).json({ message: "Database unavailable." });
  }
  try {
    await ensureFleetExtendedSeed();
    const row = await FleetMaintenance.create(payload);
    await logFleetActivity({
      action: "maintenance_recorded",
      summary: `${payload.type} scheduled for ${payload.vehiclePlate}`,
      actorUserId: String(b.recordedBy || req.headers["x-actor-user-id"] || "user-entity-1"),
      targetType: "maintenance",
      targetId: row._id?.toString(),
      meta: { vehiclePlate: payload.vehiclePlate, status: payload.status },
    });
    const o = row.toObject ? row.toObject() : row;
    return res.status(201).json({ ...o, id: o._id?.toString() });
  } catch (err) {
    console.error("Fleet maintenance create error:", err);
    return res.status(500).json({ message: "Failed to create maintenance record." });
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

app.get("/api/fleet/fuel", async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 80, 200);
  if (!isDbConnected()) {
    return res.json(defaultFleetFuelLogs.slice(0, limit).map((f, i) => ({ _id: `fuel-${i}`, ...f })));
  }
  try {
    await ensureFleetExtendedSeed();
    const list = await FleetFuelLog.find().sort({ date: -1 }).limit(limit).lean();
    return res.json(list.map((f) => ({ ...f, id: f._id?.toString() })));
  } catch (err) {
    console.error("Fleet fuel logs error:", err);
    return res.json(defaultFleetFuelLogs.slice(0, limit).map((f, i) => ({ _id: `fuel-${i}`, ...f })));
  }
});

app.post("/api/fleet/fuel", async (req, res) => {
  const b = req.body || {};
  const payload = {
    vehiclePlate: String(b.vehiclePlate || ""),
    date: String(b.date || new Date().toISOString().slice(0, 10)),
    liters: Number(b.liters || 0),
    pricePerLiter: Number(b.pricePerLiter || 0),
    totalCost:
      b.totalCost != null
        ? Number(b.totalCost || 0)
        : Number(b.liters || 0) * Number(b.pricePerLiter || 0),
    odometerKm: Number(b.odometerKm || 0),
    fuelType: String(b.fuelType || "diesel"),
    station: String(b.station || ""),
    recordedBy: String(b.recordedBy || "user-entity-1"),
  };
  if (!payload.vehiclePlate || payload.liters <= 0) {
    return res.status(400).json({ message: "vehiclePlate and liters are required." });
  }
  if (!isDbConnected()) {
    await logFleetActivity({
      action: "fuel_recorded",
      summary: `Fuel log added for ${payload.vehiclePlate}`,
      actorUserId: payload.recordedBy,
      targetType: "fuel",
      targetId: `fuel-offline-${Date.now()}`,
      meta: { liters: payload.liters, totalCost: payload.totalCost },
    });
    return res.status(201).json({ _id: `fuel-offline-${Date.now()}`, ...payload });
  }
  try {
    const row = await FleetFuelLog.create(payload);
    await logFleetActivity({
      action: "fuel_recorded",
      summary: `Fuel log added for ${payload.vehiclePlate}`,
      actorUserId: payload.recordedBy,
      targetType: "fuel",
      targetId: row._id?.toString(),
      meta: { liters: payload.liters, totalCost: payload.totalCost },
    });
    return res.status(201).json(row.toObject ? row.toObject() : row);
  } catch (err) {
    console.error("Fleet fuel create error:", err);
    return res.status(500).json({ message: "Failed to save fuel log." });
  }
});

app.get("/api/fleet/alerts", async (req, res) => {
  const status = String(req.query.status || "all");
  const limit = Math.min(parseInt(req.query.limit, 10) || 80, 200);
  const allowed = new Set(["open", "resolved", "all"]);
  const normalized = allowed.has(status) ? status : "all";
  if (!isDbConnected()) {
    const rows = normalized === "all" ? defaultFleetAlerts : defaultFleetAlerts.filter((a) => a.status === normalized);
    return res.json(rows.slice(0, limit).map((a, i) => ({ _id: `alert-${i}`, ...a })));
  }
  try {
    await ensureFleetExtendedSeed();
    const query = normalized === "all" ? {} : { status: normalized };
    const list = await FleetAlert.find(query).sort({ createdAt: -1 }).limit(limit).lean();
    return res.json(list.map((a) => ({ ...a, id: a._id?.toString() })));
  } catch (err) {
    console.error("Fleet alerts error:", err);
    const rows = normalized === "all" ? defaultFleetAlerts : defaultFleetAlerts.filter((a) => a.status === normalized);
    return res.json(rows.slice(0, limit).map((a, i) => ({ _id: `alert-${i}`, ...a })));
  }
});

app.patch("/api/fleet/alerts/:id/status", async (req, res) => {
  const { id } = req.params;
  const status = String(req.body?.status || "");
  if (!["open", "resolved"].includes(status)) {
    return res.status(400).json({ message: "status must be open or resolved" });
  }
  if (!isDbConnected()) {
    await logFleetActivity({
      action: "alert_status_updated",
      summary: `Alert ${id} set to ${status}`,
      actorUserId: String(req.body?.actorUserId || "user-entity-1"),
      targetType: "alert",
      targetId: id,
      meta: { status },
    });
    return res.json({ id, status, updated: true });
  }
  try {
    const row = await FleetAlert.findByIdAndUpdate(id, { status }, { new: true }).lean();
    if (!row) return res.status(404).json({ message: "Alert not found." });
    await logFleetActivity({
      action: "alert_status_updated",
      summary: `Alert ${id} set to ${status}`,
      actorUserId: String(req.body?.actorUserId || "user-entity-1"),
      targetType: "alert",
      targetId: id,
      meta: { status },
    });
    return res.json({ ...row, id: row._id?.toString() });
  } catch (err) {
    console.error("Fleet alert status update error:", err);
    return res.status(500).json({ message: "Failed to update alert status." });
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

app.get("/api/fleet/permissions-matrix", (req, res) => {
  res.json(permissionsMatrix);
});

app.get("/api/fleet/users", async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json(defaultFleetUsers.map((u, i) => ({ _id: `user-${i}`, ...u, id: `user-${i}` })));
    }
    await ensureFleetAdminSeed();
    const list = await FleetUser.find().populate("organizationId", "name slug").lean();
    return res.json(list.map((u) => ({ ...u, id: u._id?.toString() })));
  } catch (err) {
    console.error("Fleet users error:", err);
    return res.json(defaultFleetUsers.map((u, i) => ({ _id: `user-${i}`, ...u, id: `user-${i}` })));
  }
});

app.get("/api/fleet/trips", async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
  try {
    if (!isDbConnected()) {
      return res.json(sampleTripsForSeed.map((t, i) => ({ id: `trip-${i}`, ...t })));
    }
    await ensureDriverSeed();
    await ensureFleetAdminSeed();
    const list = await Trip.find().sort({ date: -1 }).limit(limit).lean();
    return res.json(list.map((t) => ({
      id: t._id?.toString(),
      driverId: t.driverId ?? null,
      passengerId: t.passengerId ?? null,
      date: t.date,
      distanceKm: t.distanceKm ?? 0,
      durationMin: t.durationMin ?? 0,
      startLocation: t.startLocation || "",
      endLocation: t.endLocation || "",
      score: t.score ?? 0,
      status: t.status || "pending",
      vehicleId: t.vehicleId ?? null,
    })));
  } catch (err) {
    console.error("Fleet trips error:", err);
    return res.json(sampleTripsForSeed.map((t, i) => ({ id: `trip-${i}`, ...t })));
  }
});

app.post("/api/fleet/trips", async (req, res) => {
  const { passengerId, startLocation, endLocation, date } = req.body || {};
  const payload = {
    passengerId: passengerId || null,
    startLocation: startLocation || "",
    endLocation: endLocation || "",
    date: date || new Date().toISOString().slice(0, 10),
    distanceKm: 0,
    durationMin: 0,
    score: 0,
    status: "pending",
    driverId: null,
    vehicleId: null,
  };
  if (!isDbConnected()) {
    const oid = `trip-offline-${Date.now()}`;
    await logFleetActivity({
      action: "trip_booked",
      summary: `Ride booked ${payload.startLocation} → ${payload.endLocation}`,
      actorUserId: passengerId || "passenger",
      targetType: "trip",
      targetId: oid,
      meta: { passengerId },
    });
    return res.status(201).json({ id: oid, ...payload });
  }
  try {
    const trip = await Trip.create(payload);
    const t = trip.toObject ? trip.toObject() : trip;
    const tid = t._id?.toString();
    await logFleetActivity({
      action: "trip_booked",
      summary: `Ride booked ${t.startLocation} → ${t.endLocation}`,
      actorUserId: t.passengerId || "passenger",
      targetType: "trip",
      targetId: tid,
      meta: { passengerId: t.passengerId },
    });
    return res.status(201).json({
      id: t._id?.toString(),
      driverId: t.driverId,
      passengerId: t.passengerId,
      date: t.date,
      distanceKm: t.distanceKm,
      durationMin: t.durationMin,
      startLocation: t.startLocation,
      endLocation: t.endLocation,
      score: t.score,
      status: t.status,
      vehicleId: t.vehicleId,
    });
  } catch (err) {
    console.error("Fleet trip book error:", err);
    return res.status(500).json({ message: "Failed to book trip." });
  }
});

app.patch("/api/fleet/trips/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  const allowed = ["pending", "assigned", "in_progress", "completed", "rejected"];
  if (!status || !allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid status. Use one of: " + allowed.join(", ") });
  }
  if (!isDbConnected()) {
    await logFleetActivity({ action: "trip_status", summary: `Trip ${id} → ${status}`, targetType: "trip", targetId: id, meta: { status } });
    return res.json({ id, status, updated: true });
  }
  try {
    const trip = await Trip.findByIdAndUpdate(id, { status }, { new: true }).lean();
    if (!trip) return res.status(404).json({ message: "Trip not found." });
    await logFleetActivity({
      action: "trip_status",
      summary: `Trip ${id} → ${status}`,
      actorUserId: trip.driverId || "",
      targetType: "trip",
      targetId: id,
      meta: { status },
    });
    return res.json({
      id: trip._id?.toString(),
      driverId: trip.driverId,
      passengerId: trip.passengerId,
      date: trip.date,
      status: trip.status,
      startLocation: trip.startLocation,
      endLocation: trip.endLocation,
    });
  } catch (err) {
    console.error("Fleet trip status error:", err);
    return res.status(500).json({ message: "Failed to update trip status." });
  }
});

app.post("/api/fleet/trips/:id/assign", async (req, res) => {
  const { id } = req.params;
  const { driverId, vehicleId } = req.body || {};
  if (!isDbConnected()) {
    await logFleetActivity({
      action: "trip_assigned",
      summary: `Trip ${id} assigned to ${driverId || "driver"}`,
      actorUserId: "user-entity-1",
      targetType: "trip",
      targetId: id,
      meta: { driverId, vehicleId },
    });
    return res.json({ id, driverId: driverId || null, vehicleId: vehicleId || null, status: "assigned", updated: true });
  }
  try {
    const trip = await Trip.findByIdAndUpdate(
      id,
      { driverId: driverId || null, vehicleId: vehicleId || null, status: "assigned" },
      { new: true }
    ).lean();
    if (!trip) return res.status(404).json({ message: "Trip not found." });
    await logFleetActivity({
      action: "trip_assigned",
      summary: `Trip assigned to ${trip.driverId}`,
      actorUserId: "user-entity-1",
      targetType: "trip",
      targetId: trip._id?.toString(),
      meta: { driverId: trip.driverId, vehicleId: trip.vehicleId },
    });
    return res.json({
      id: trip._id?.toString(),
      driverId: trip.driverId,
      passengerId: trip.passengerId,
      date: trip.date,
      status: trip.status,
      vehicleId: trip.vehicleId,
      startLocation: trip.startLocation,
      endLocation: trip.endLocation,
    });
  } catch (err) {
    console.error("Fleet trip assign error:", err);
    return res.status(500).json({ message: "Failed to assign trip." });
  }
});

app.get("/api/fleet/trips/assigned", async (req, res) => {
  const driverId = req.query.driverId || req.headers["x-driver-id"] || "";
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
  if (!driverId) {
    return res.json([]);
  }
  if (!isDbConnected()) {
    const assigned = sampleTripsForSeed.filter((t) => t.driverId === driverId);
    return res.json(assigned.map((t, i) => ({ id: `trip-assigned-${i}`, ...t })));
  }
  try {
    const list = await Trip.find({ driverId, status: { $in: ["assigned", "in_progress"] } })
      .sort({ date: -1 })
      .limit(limit)
      .lean();
    return res.json(list.map((t) => ({
      id: t._id?.toString(),
      driverId: t.driverId,
      passengerId: t.passengerId,
      date: t.date,
      distanceKm: t.distanceKm,
      durationMin: t.durationMin,
      startLocation: t.startLocation || "",
      endLocation: t.endLocation || "",
      score: t.score ?? 0,
      status: t.status,
      vehicleId: t.vehicleId,
    })));
  } catch (err) {
    console.error("Fleet assigned trips error:", err);
    return res.json([]);
  }
});

let fleetSystemSettings = {
  siteName: "AutoSphere Fleet",
  maintenanceWindowUtc: "Sun 02:00–04:00",
  dataRetentionDays: 365,
  requireMfaForAdmins: true,
  complianceNote: "GDPR-aligned data handling; audit trail enabled per BRD §6.",
};

app.get("/api/fleet/settings", (req, res) => {
  res.json(fleetSystemSettings);
});

app.put("/api/fleet/settings", (req, res) => {
  const b = req.body || {};
  fleetSystemSettings = {
    ...fleetSystemSettings,
    ...(b.siteName != null && { siteName: String(b.siteName) }),
    ...(b.maintenanceWindowUtc != null && { maintenanceWindowUtc: String(b.maintenanceWindowUtc) }),
    ...(typeof b.dataRetentionDays === "number" && { dataRetentionDays: b.dataRetentionDays }),
    ...(typeof b.requireMfaForAdmins === "boolean" && { requireMfaForAdmins: b.requireMfaForAdmins }),
    ...(b.complianceNote != null && { complianceNote: String(b.complianceNote) }),
  };
  logFleetActivity({
    action: "system_settings_updated",
    summary: "Fleet system settings updated",
    actorUserId: req.headers["x-actor-user-id"] || "user-super-1",
    targetType: "settings",
    targetId: "global",
  });
  res.json(fleetSystemSettings);
});

app.get("/api/fleet/vehicles/public", async (req, res) => {
  const notice =
    "Guest view — limited public information only. Booking and trip management are not available.";
  try {
    if (!isDbConnected()) {
      const limited = dedupeVehiclesByPlate(defaultFleetVehicles.map(mapFleetVehicleToPublic));
      return res.json({ vehicles: limited, notice });
    }
    await ensureFleetSeed();
    const list = await FleetVehicle.find().lean();
    const mapped = list.map((v) => mapFleetVehicleToPublic(v)).filter((v) => v.plateNumber);
    return res.json({ vehicles: dedupeVehiclesByPlate(mapped), notice });
  } catch (err) {
    console.error("Fleet public vehicles error:", err);
    const limited = dedupeVehiclesByPlate(defaultFleetVehicles.map(mapFleetVehicleToPublic));
    res.json({ vehicles: limited, notice });
  }
});

app.get("/api/fleet/billing/passenger", async (req, res) => {
  const passengerId = String(req.query.passengerId || "user-passenger-1");
  try {
    if (!isDbConnected()) {
      const rows = sampleTripsForSeed
        .filter((t) => t.passengerId === passengerId)
        .map((t, i) => ({ ...t, id: `seed-${passengerId}-${i}` }));
      return res.json(buildPassengerBillingPayload(passengerId, rows));
    }
    await ensureDriverSeed();
    const list = await Trip.find({ passengerId }).sort({ date: -1 }).limit(80).lean();
    return res.json(buildPassengerBillingPayload(passengerId, list));
  } catch (err) {
    console.error("Fleet passenger billing error:", err);
    return res.status(500).json({
      message: "Failed to load billing",
      passengerId,
      currency: "USD",
      lines: [],
      balanceDue: 0,
    });
  }
});

app.get("/api/fleet/trips/passenger", async (req, res) => {
  const passengerId = req.query.passengerId || "";
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
  if (!passengerId) return res.json([]);
  if (!isDbConnected()) {
    const rows = sampleTripsForSeed.filter((t) => t.passengerId === passengerId);
    return res.json(rows.map((t, i) => ({ id: `p-trip-${i}`, ...t })));
  }
  try {
    const list = await Trip.find({ passengerId }).sort({ date: -1 }).limit(limit).lean();
    return res.json(
      list.map((t) => ({
        id: t._id?.toString(),
        driverId: t.driverId,
        passengerId: t.passengerId,
        date: t.date,
        status: t.status || "pending",
        startLocation: t.startLocation || "",
        endLocation: t.endLocation || "",
        distanceKm: t.distanceKm ?? 0,
        durationMin: t.durationMin ?? 0,
      }))
    );
  } catch (err) {
    console.error(err);
    return res.json([]);
  }
});

app.post("/api/fleet/trips/:id/respond", async (req, res) => {
  const { id } = req.params;
  const { driverId, action } = req.body || {};
  if (!driverId) return res.status(400).json({ message: "driverId required" });
  if (!["accept", "reject"].includes(action)) return res.status(400).json({ message: "action: accept | reject" });
  if (!isDbConnected()) {
    await logFleetActivity({
      action: action === "accept" ? "trip_driver_accept" : "trip_driver_reject",
      summary: `Driver ${driverId} ${action}ed trip ${id}`,
      actorUserId: driverId,
      targetType: "trip",
      targetId: id,
    });
    return res.json({ id, status: action === "accept" ? "in_progress" : "rejected", updated: true });
  }
  try {
    const trip = await Trip.findById(id).lean();
    if (!trip) return res.status(404).json({ message: "Trip not found." });
    if (trip.driverId !== driverId) return res.status(403).json({ message: "Trip not assigned to this driver." });
    if (trip.status !== "assigned") {
      return res.status(400).json({ message: "Trip must be in assigned status to accept/reject." });
    }
    const status = action === "accept" ? "in_progress" : "rejected";
    const updated = await Trip.findByIdAndUpdate(id, { status }, { new: true }).lean();
    await logFleetActivity({
      action: action === "accept" ? "trip_driver_accept" : "trip_driver_reject",
      summary: `Driver ${driverId} ${action}ed trip`,
      actorUserId: driverId,
      targetType: "trip",
      targetId: id,
    });
    return res.json({
      id: updated._id?.toString(),
      status: updated.status,
      driverId: updated.driverId,
      passengerId: updated.passengerId,
      startLocation: updated.startLocation,
      endLocation: updated.endLocation,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to respond to trip." });
  }
});

app.patch("/api/fleet/users/:userId/role", async (req, res) => {
  const { userId } = req.params;
  const { roleSlug, actorUserId } = req.body || {};
  if (!roleSlug) return res.status(400).json({ message: "roleSlug required" });
  const allowed = ["driver", "passenger", "entity_admin", "super_admin", "guest"];
  if (!allowed.includes(roleSlug)) return res.status(400).json({ message: "Invalid roleSlug" });
  if (!isDbConnected()) {
    await logFleetActivity({
      action: "user_role_changed",
      summary: `User ${userId} role → ${roleSlug}`,
      actorUserId: actorUserId || "user-super-1",
      targetType: "user",
      targetId: userId,
      meta: { roleSlug },
    });
    return res.json({ userId, roleSlug, updated: true });
  }
  try {
    const u = await FleetUser.findOneAndUpdate({ userId }, { roleSlug }, { new: true }).lean();
    if (!u) return res.status(404).json({ message: "User not found" });
    await logFleetActivity({
      action: "user_role_changed",
      summary: `${u.fullName || userId} role set to ${roleSlug}`,
      actorUserId: actorUserId || "user-entity-1",
      targetType: "user",
      targetId: userId,
      meta: { roleSlug },
    });
    return res.json({ ...u, id: u._id?.toString() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update role" });
  }
});

app.get("/api/fleet/activity-log", async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 80, 200);
  if (!isDbConnected()) {
    const mem = fleetActivityMemory.slice(0, limit);
    const merged = [...mem];
    for (const s of defaultFleetActivitySamples) {
      if (merged.length >= limit) break;
      merged.push({ _id: `sample-${s.targetId}`, ...s, createdAt: new Date(), updatedAt: new Date() });
    }
    return res.json(merged.slice(0, limit));
  }
  try {
    await ensureFleetAdminSeed();
    const count = await FleetActivityLog.countDocuments();
    if (count === 0) {
      await FleetActivityLog.insertMany(
        defaultFleetActivitySamples.map((s) => ({
          ...s,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      );
    }
    const list = await FleetActivityLog.find().sort({ createdAt: -1 }).limit(limit).lean();
    return res.json(list.map((r) => ({ ...r, id: r._id?.toString() })));
  } catch (err) {
    console.error(err);
    return res.json(fleetActivityMemory.slice(0, limit));
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
const samplePortfolio = {
  activePolicies: 3,
  totalPremium: 4280,
  riskExposure: 18,
  openClaims: 1,
  lossRatio: 0.14,
  premiumByCoverage: [
    { coverage: "Comprehensive", count: 2, premium: 2680 },
    { coverage: "Liability", count: 1, premium: 860 },
    { coverage: "Collision", count: 0, premium: 0 },
  ],
  premiumTrend: [
    { month: "Oct", premium: 4100 },
    { month: "Nov", premium: 4150 },
    { month: "Dec", premium: 4200 },
    { month: "Jan", premium: 4220 },
    { month: "Feb", premium: 4250 },
    { month: "Mar", premium: 4280 },
  ],
  topRisks: [
    { driverId: "driver1", name: "Alex Rivera", riskScore: 14, mobilityScore: 86 },
    { driverId: "driver2", name: "Jordan Lee", riskScore: 22, mobilityScore: 78 },
    { driverId: "driver3", name: "Sam Chen", riskScore: 31, mobilityScore: 69 },
  ],
  recentClaims: [
    { id: "CLM-001", driverId: "driver1", date: "2025-03-10", amount: 1200, status: "assessing", description: "Rear bumper" },
    { id: "CLM-002", driverId: "driver1", date: "2025-02-28", amount: 450, status: "paid", description: "Windshield" },
  ],
  policiesExpiringSoon: [
    { driverId: "driver1", provider: "State Farm", policyNumber: "POL-2024-45678", expiryDate: "2025-09-15" },
  ],
  lastUpdated: new Date().toISOString(),
};

function isExpiringWithinDays(expiryDateStr, days = 90) {
  if (!expiryDateStr) return false;
  try {
    const expiry = new Date(expiryDateStr);
    const now = new Date();
    const limit = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return expiry >= now && expiry <= limit;
  } catch {
    return false;
  }
}

app.get("/api/insurance/portfolio", async (req, res) => {
  let dataSource = "fallback";
  try {
    let activePolicies = samplePortfolio.activePolicies;
    let totalPremium = samplePortfolio.totalPremium;
    let riskExposure = samplePortfolio.riskExposure;
    let openClaims = samplePortfolio.openClaims;
    let lossRatio = samplePortfolio.lossRatio;
    let premiumByCoverage = samplePortfolio.premiumByCoverage;
    let premiumTrend = samplePortfolio.premiumTrend;
    let topRisks = samplePortfolio.topRisks;
    let recentClaims = samplePortfolio.recentClaims;
    let policiesExpiringSoon = samplePortfolio.policiesExpiringSoon;

    if (isDbConnected()) {
      dataSource = "live";
      await ensureDriverSeed();
      const policies = await Insurance.find().lean();
      const scores = await MobilityScore.find().lean();
      const profiles = await Profile.find().lean();
      totalPremium = policies.reduce((a, p) => a + (p.premium || 0), 0) || samplePortfolio.totalPremium;
      activePolicies = policies.length || 1;
      const avgMobility = scores.length ? scores.reduce((a, s) => a + (s.overall || 0), 0) / scores.length : 82;
      riskExposure = Math.round(100 - avgMobility);

      const coverageMap = new Map();
      policies.forEach((p) => {
        const cov = p.coverage || "Other";
        const prev = coverageMap.get(cov) || { count: 0, premium: 0 };
        coverageMap.set(cov, { count: prev.count + 1, premium: prev.premium + (p.premium || 0) });
      });
      premiumByCoverage = Array.from(coverageMap.entries()).map(([coverage, v]) => ({ coverage, count: v.count, premium: v.premium }));

      const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
      const base = totalPremium * 0.95;
      premiumTrend = months.map((m, i) => ({ month: m, premium: Math.round(base + (totalPremium - base) * (i + 1) / 6) }));

      const scoreByDriver = new Map(scores.map((s) => [s.driverId, s.overall ?? 0]));
      topRisks = profiles
        .map((p) => ({
          driverId: p.driverId,
          name: p.fullName || p.username || p.driverId,
          riskScore: Math.round(100 - (scoreByDriver.get(p.driverId) ?? 80)),
          mobilityScore: scoreByDriver.get(p.driverId) ?? 80,
        }))
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, 5);

      policiesExpiringSoon = policies
        .filter((p) => isExpiringWithinDays(p.expiryDate, 90))
        .map((p) => ({
          driverId: p.driverId,
          provider: p.provider || "",
          policyNumber: p.policyNumber || "",
          expiryDate: p.expiryDate || "",
        }))
        .slice(0, 10);

      let allClaims = [];
      try {
        allClaims = [...(await getClaimsList()), ...driverClaimsInMemory];
      } catch (_) {
        allClaims = [...driverClaimsInMemory];
      }
      allClaims.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      openClaims = allClaims.filter((c) => !["paid", "rejected", "closed"].includes((c.status || "").toLowerCase())).length;
      const paidTotal = allClaims.filter((c) => (c.status || "").toLowerCase() === "paid").reduce((a, c) => a + (c.amount || 0), 0);
      lossRatio = totalPremium > 0 ? Math.round((paidTotal / totalPremium) * 100) / 100 : 0.12;
      recentClaims = allClaims.slice(0, 5).map((c) => ({
        id: c.id,
        driverId: c.driverId,
        date: c.date,
        amount: c.amount ?? 0,
        status: c.status || "unknown",
        description: c.description || "",
      }));
    }

    const lastUpdated = new Date().toISOString();
    return res.json({
      dataSource,
      activePolicies,
      totalPremium,
      riskExposure,
      openClaims,
      lossRatio,
      premiumByCoverage,
      premiumTrend,
      topRisks,
      recentClaims,
      policiesExpiringSoon,
      lastUpdated,
    });
  } catch (err) {
    console.error("Insurance portfolio error:", err);
    return res.status(200).json({
      ...samplePortfolio,
      dataSource: "fallback",
      lastUpdated: new Date().toISOString(),
    });
  }
});

async function getClaimsList() {
  if (isDbConnected()) {
    try {
      const docs = await InsuranceClaim.find().lean();
      return docs.map((d) => ({
        id: d.claimId,
        driverId: d.driverId,
        date: d.date || "",
        amount: d.amount ?? 0,
        status: d.status || "submitted",
        description: d.description || "",
        assessmentId: d.assessmentId || null,
        damageType: d.damageType || "General",
        affectedParts: Array.isArray(d.affectedParts) ? d.affectedParts : [],
      }));
    } catch (err) {
      console.error("getClaimsList error:", err);
    }
  }
  return [
    { id: "CLM-001", driverId: "driver1", date: "2025-03-10", amount: 1200, status: "assessing", description: "Rear bumper" },
    { id: "CLM-002", driverId: "driver1", date: "2025-02-28", amount: 0, status: "paid", description: "Windshield" },
  ];
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

app.post("/api/driver/claims", async (req, res) => {
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
    if (!isDbConnected()) driverClaimsInMemory.push(claim);
    if (isDbConnected()) {
      try {
        await InsuranceClaim.findOneAndUpdate(
          { claimId: claim.id },
          {
            claimId: claim.id,
            driverId: claim.driverId,
            date: claim.date,
            amount: claim.amount,
            status: claim.status,
            description: claim.description,
            assessmentId: claim.assessmentId || "",
            damageType: claim.damageType || "General",
            affectedParts: claim.affectedParts || [],
          },
          { upsert: true, new: true }
        );
      } catch (dbErr) {
        console.error("InsuranceClaim save error:", dbErr);
      }
    }
    return res.status(201).json({ success: true, claim });
  } catch (err) {
    console.error("Claims submit error:", err);
    return res.status(200).json({ success: false, error: "Submit failed", claim: null });
  }
});

app.get("/api/insurance/policies", async (req, res) => {
  const fallbackPolicies = [
    { driverId: "driver1", driverName: "Alex Rivera", provider: "State Farm", policyNumber: "POL-2024-45678", expiryDate: "2025-09-15", premium: 1240, coverage: "Comprehensive" },
  ];
  try {
    let dataSource = "fallback";
    let list = fallbackPolicies;
    if (isDbConnected()) {
      dataSource = "live";
      await ensureDriverSeed();
      const policies = await Insurance.find().lean();
      const driverIds = [...new Set(policies.map((p) => p.driverId).filter(Boolean))];
      const profiles = driverIds.length ? await Profile.find({ driverId: { $in: driverIds } }).lean() : [];
      const nameByDriver = new Map(profiles.map((p) => [p.driverId, p.fullName || p.username || p.driverId]));
      list = policies.map((p) => ({
        driverId: p.driverId,
        driverName: nameByDriver.get(p.driverId) || p.driverId,
        provider: p.provider || "",
        policyNumber: p.policyNumber || "",
        expiryDate: p.expiryDate || "",
        premium: p.premium ?? 0,
        coverage: p.coverage || "",
      }));
    }
    const totalPremium = list.reduce((sum, p) => sum + (p.premium || 0), 0);
    const expiringSoonCount = list.filter((p) => isExpiringWithinDays(p.expiryDate, 90)).length;
    return res.json({
      dataSource,
      policies: list,
      summary: { totalPolicies: list.length, totalPremium, expiringSoonCount },
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Insurance policies error:", err);
    return res.status(200).json({
      dataSource: "fallback",
      policies: fallbackPolicies,
      summary: { totalPolicies: fallbackPolicies.length, totalPremium: 1240, expiringSoonCount: 1 },
      lastUpdated: new Date().toISOString(),
    });
  }
});

app.get("/api/insurance/claims", async (req, res) => {
  const fallbackClaims = [
    { id: "CLM-001", driverId: "driver1", driverName: "Alex Rivera", date: "2025-03-10", amount: 1200, status: "assessing", description: "Rear bumper damage", damageType: "Rear damage" },
    { id: "CLM-002", driverId: "driver1", driverName: "Alex Rivera", date: "2025-02-28", amount: 420, status: "paid", description: "Windshield chip repair", damageType: "Windshield / glass" },
    { id: "CLM-003", driverId: "driver2", driverName: "Jordan Lee", date: "2025-03-05", amount: 0, status: "submitted", description: "Minor door dent", damageType: "Side damage" },
  ];
  try {
    let dataSource = "fallback";
    let list = fallbackClaims;
    if (isDbConnected()) {
      dataSource = "live";
      list = await getClaimsList();
      const driverIds = [...new Set(list.map((c) => c.driverId).filter(Boolean))];
      const profiles = driverIds.length ? await Profile.find({ driverId: { $in: driverIds } }).lean() : [];
      const nameByDriver = new Map(profiles.map((p) => [p.driverId, p.fullName || p.username || p.driverId]));
      list = list.map((c) => ({ ...c, driverName: nameByDriver.get(c.driverId) || c.driverId }));
    }
    list.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    const resolvedStatuses = ["paid", "rejected", "closed"];
    const openCount = list.filter((c) => !resolvedStatuses.includes((c.status || "").toLowerCase())).length;
    const paidCount = list.filter((c) => (c.status || "").toLowerCase() === "paid").length;
    const totalPaidAmount = list.filter((c) => (c.status || "").toLowerCase() === "paid").reduce((sum, c) => sum + (c.amount || 0), 0);
    return res.json({
      dataSource,
      claims: list,
      summary: { openCount, paidCount, totalPaidAmount, totalClaims: list.length },
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Insurance claims error:", err);
    return res.status(200).json({
      dataSource: "fallback",
      claims: fallbackClaims,
      summary: {
        openCount: 2,
        paidCount: 1,
        totalPaidAmount: 420,
        totalClaims: fallbackClaims.length,
      },
      lastUpdated: new Date().toISOString(),
    });
  }
});

// ---------- Insurance: Dynamic premium adjustment ----------
const defaultPremiumRules = {
  riskBands: [
    { minScore: 0, maxScore: 24, label: "Low risk", surchargePercent: -10 },
    { minScore: 25, maxScore: 39, label: "Medium risk", surchargePercent: 0 },
    { minScore: 40, maxScore: 59, label: "Elevated risk", surchargePercent: 15 },
    { minScore: 60, maxScore: 100, label: "High risk", surchargePercent: 35 },
  ],
  discounts: [
    { id: "d1", name: "Claims-free", condition: "No claims in 3 years", percent: 15 },
    { id: "d2", name: "Multi-policy", condition: "Auto + home bundled", percent: 10 },
    { id: "d3", name: "Good driver", condition: "Mobility score ≥ 85", percent: 8 },
    { id: "d4", name: "Pay in full", condition: "Annual payment", percent: 5 },
  ],
  surcharges: [
    { id: "s1", name: "New driver", condition: "License < 3 years", percent: 12 },
    { id: "s2", name: "At-fault claim", condition: "Claim in last 18 months", percent: 20 },
    { id: "s3", name: "Low mobility score", condition: "Score < 70", percent: 15 },
  ],
};

const defaultPremiumSegments = [
  { segmentType: "coverage", segmentValue: "Comprehensive", policyCount: 2, totalPremium: 2760, averagePremium: 1380 },
  { segmentType: "coverage", segmentValue: "Liability Plus", policyCount: 1, totalPremium: 980, averagePremium: 980 },
  { segmentType: "coverage", segmentValue: "Standard", policyCount: 1, totalPremium: 1100, averagePremium: 1100 },
];

app.get("/api/insurance/dynamic-premium", async (req, res) => {
  try {
    let dataSource = "fallback";
    let rules = defaultPremiumRules;
    let segments = defaultPremiumSegments;
    let summary = { totalPremium: 6190, activePolicies: 5, lossRatio: 0.14, totalClaimsPaid: 4370 };

    if (isDbConnected()) {
      dataSource = "live";
      await ensureDriverSeed();
      const policies = await Insurance.find().lean();
      const allClaims = await getClaimsList().catch(() => []);
      const paidTotal = (allClaims || []).filter((c) => (c.status || "").toLowerCase() === "paid").reduce((a, c) => a + (c.amount || 0), 0);
      const totalPremium = policies.reduce((a, p) => a + (p.premium || 0), 0) || 1;
      const lossRatio = totalPremium > 0 ? Math.round((paidTotal / totalPremium) * 100) / 100 : 0.14;
      summary = { totalPremium, activePolicies: policies.length, lossRatio, totalClaimsPaid: paidTotal };

      const coverageMap = new Map();
      policies.forEach((p) => {
        const cov = p.coverage || "Other";
        const prev = coverageMap.get(cov) || { count: 0, premium: 0 };
        coverageMap.set(cov, { count: prev.count + 1, premium: prev.premium + (p.premium || 0) });
      });
      segments = Array.from(coverageMap.entries()).map(([segmentValue, v]) => ({
        segmentType: "coverage",
        segmentValue,
        policyCount: v.count,
        totalPremium: v.premium,
        averagePremium: v.count > 0 ? Math.round(v.premium / v.count) : 0,
      }));
    }

    return res.json({
      dataSource,
      rules,
      segments,
      summary,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Dynamic premium error:", err);
    return res.status(200).json({
      dataSource: "fallback",
      rules: defaultPremiumRules,
      segments: defaultPremiumSegments,
      summary: { totalPremium: 6190, activePolicies: 5, lossRatio: 0.14, totalClaimsPaid: 4370 },
      lastUpdated: new Date().toISOString(),
    });
  }
});

// ---------- Insurance: AI Fraud Detection ----------
function computeFraudScore(claim, claimCountByDriver, claimsSameDriver) {
  let score = 0;
  const flags = [];
  const amount = claim.amount || 0;
  if (amount > 2000) {
    score += 25;
    flags.push("high_amount");
  } else if (amount > 1000) {
    score += 15;
    flags.push("elevated_amount");
  }
  const count = claimCountByDriver.get(claim.driverId) || 0;
  if (count >= 3) {
    score += 35;
    flags.push("multiple_claims");
  } else if (count >= 2) {
    score += 20;
    flags.push("repeat_claims");
  }
  const recentSameDriver = (claimsSameDriver || []).filter((c) => c.id !== claim.id).length;
  if (recentSameDriver >= 2) flags.push("cluster_activity");
  if (recentSameDriver >= 1) score += 10;
  return { score: Math.min(100, score), flags };
}

const fallbackFraudRiskFlags = [
  { claimId: "CLM-001", driverId: "driver1", driverName: "Alex Rivera", fraudScore: 35, flags: ["repeat_claims"], amount: 1200, date: "2025-03-10" },
  { claimId: "CLM-004", driverId: "driver3", driverName: "Sam Chen", fraudScore: 40, flags: ["high_amount", "repeat_claims"], amount: 1850, date: "2025-02-15" },
];
const fallbackFraudQueue = [
  { claimId: "CLM-004", driverId: "driver3", driverName: "Sam Chen", fraudScore: 40, reason: "High amount + multiple claims", priority: "high" },
  { claimId: "CLM-001", driverId: "driver1", driverName: "Alex Rivera", fraudScore: 35, reason: "Multiple claims", priority: "medium" },
];

app.get("/api/insurance/fraud-detection", async (req, res) => {
  try {
    let dataSource = "fallback";
    let claims = [];
    let nameByDriver = new Map();
    if (isDbConnected()) {
      dataSource = "live";
      claims = await getClaimsList();
      const driverIds = [...new Set(claims.map((c) => c.driverId).filter(Boolean))];
      const profiles = driverIds.length ? await Profile.find({ driverId: { $in: driverIds } }).lean() : [];
      nameByDriver = new Map(profiles.map((p) => [p.driverId, p.fullName || p.username || p.driverId]));
    } else {
      claims = [
        { id: "CLM-001", driverId: "driver1", date: "2025-03-10", amount: 1200, status: "assessing", description: "Rear bumper" },
        { id: "CLM-002", driverId: "driver1", date: "2025-02-28", amount: 420, status: "paid", description: "Windshield" },
        { id: "CLM-003", driverId: "driver2", date: "2025-03-05", amount: 0, status: "submitted", description: "Door dent" },
        { id: "CLM-004", driverId: "driver3", date: "2025-02-15", amount: 1850, status: "approved", description: "Front collision" },
      ];
    }
    const claimCountByDriver = new Map();
    claims.forEach((c) => {
      const id = c.driverId || "";
      claimCountByDriver.set(id, (claimCountByDriver.get(id) || 0) + 1);
    });
    const claimsByDriver = new Map();
    claims.forEach((c) => {
      const id = c.driverId || "";
      if (!claimsByDriver.has(id)) claimsByDriver.set(id, []);
      claimsByDriver.get(id).push(c);
    });

    const riskFlags = claims.map((c) => {
      const { score, flags } = computeFraudScore(c, claimCountByDriver, claimsByDriver.get(c.driverId) || []);
      return {
        claimId: c.id,
        driverId: c.driverId,
        driverName: nameByDriver.get(c.driverId) || c.driverId,
        fraudScore: score,
        flags,
        amount: c.amount ?? 0,
        date: c.date || "",
      };
    }).filter((r) => r.fraudScore > 0);
    riskFlags.sort((a, b) => b.fraudScore - a.fraudScore);

    const investigationQueue = riskFlags.slice(0, 10).map((r) => ({
      claimId: r.claimId,
      driverId: r.driverId,
      driverName: r.driverName,
      fraudScore: r.fraudScore,
      reason: r.flags.includes("high_amount") && r.flags.includes("multiple_claims") ? "High amount + multiple claims" : r.flags.includes("multiple_claims") ? "Multiple claims" : r.flags.includes("high_amount") ? "High claim amount" : "Elevated risk",
      priority: r.fraudScore >= 40 ? "high" : r.fraudScore >= 25 ? "medium" : "low",
    }));

    const nodeIds = new Set();
    claims.forEach((c) => {
      nodeIds.add(`driver:${c.driverId}`);
      nodeIds.add(`claim:${c.id}`);
    });
    const nodes = [
      ...[...nodeIds].filter((id) => id.startsWith("driver:")).map((id) => ({ id, type: "driver", label: nameByDriver.get(id.replace("driver:", "")) || id.replace("driver:", "") })),
      ...claims.map((c) => ({ id: `claim:${c.id}`, type: "claim", label: c.id })),
    ];
    const edges = claims.map((c) => ({ from: `driver:${c.driverId}`, to: `claim:${c.id}`, type: "filed" }));

    const highRiskCount = riskFlags.filter((r) => r.fraudScore >= 25).length;
    return res.json({
      dataSource,
      summary: { totalClaimsAnalyzed: claims.length, highRiskCount, inInvestigationCount: investigationQueue.length },
      riskFlags,
      investigationQueue,
      graph: { nodes, edges },
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Fraud detection error:", err);
    return res.status(200).json({
      dataSource: "fallback",
      summary: { totalClaimsAnalyzed: 4, highRiskCount: 2, inInvestigationCount: 2 },
      riskFlags: fallbackFraudRiskFlags,
      investigationQueue: fallbackFraudQueue,
      graph: {
        nodes: [
          { id: "driver:driver1", type: "driver", label: "Alex Rivera" },
          { id: "driver:driver2", type: "driver", label: "Jordan Lee" },
          { id: "claim:CLM-001", type: "claim", label: "CLM-001" },
          { id: "claim:CLM-002", type: "claim", label: "CLM-002" },
          { id: "claim:CLM-003", type: "claim", label: "CLM-003" },
        ],
        edges: [
          { from: "driver:driver1", to: "claim:CLM-001", type: "filed" },
          { from: "driver:driver1", to: "claim:CLM-002", type: "filed" },
          { from: "driver:driver2", to: "claim:CLM-003", type: "filed" },
        ],
      },
      lastUpdated: new Date().toISOString(),
    });
  }
});

// ---------- Insurance: Risk Heatmaps ----------
function heatmapRiskLevel(claimCount, totalAmount) {
  if (claimCount >= 3 || totalAmount >= 3000) return "high";
  if (claimCount >= 2 || totalAmount >= 1500) return "medium";
  return "low";
}

const fallbackRegionHeatmap = [
  { regionKey: "State Farm", regionLabel: "State Farm", claimCount: 2, totalAmount: 1620, riskLevel: "medium" },
  { regionKey: "Geico", regionLabel: "Geico", claimCount: 1, totalAmount: 0, riskLevel: "low" },
];
const fallbackTimeHeatmap = [
  { periodKey: "2025-03", periodLabel: "Mar 2025", claimCount: 3, totalAmount: 1200, riskLevel: "medium" },
  { periodKey: "2025-02", periodLabel: "Feb 2025", claimCount: 2, totalAmount: 2270, riskLevel: "high" },
  { periodKey: "2025-01", periodLabel: "Jan 2025", claimCount: 1, totalAmount: 0, riskLevel: "low" },
];
const fallbackSegmentHeatmap = [
  { segmentKey: "Comprehensive", segmentLabel: "Comprehensive", claimCount: 3, totalAmount: 3470, riskLevel: "high" },
  { segmentKey: "Liability Plus", segmentLabel: "Liability Plus", claimCount: 1, totalAmount: 0, riskLevel: "low" },
];

app.get("/api/insurance/risk-heatmaps", async (req, res) => {
  try {
    let dataSource = "fallback";
    let claims = [];
    let providerByDriver = new Map();
    let coverageByDriver = new Map();

    if (isDbConnected()) {
      dataSource = "live";
      claims = await getClaimsList();
      const policies = await Insurance.find().lean();
      policies.forEach((p) => {
        if (p.driverId) {
          if (p.provider) providerByDriver.set(p.driverId, p.provider);
          if (p.coverage) coverageByDriver.set(p.driverId, p.coverage);
        }
      });
    } else {
      claims = [
        { id: "CLM-001", driverId: "driver1", date: "2025-03-10", amount: 1200 },
        { id: "CLM-002", driverId: "driver1", date: "2025-02-28", amount: 420 },
        { id: "CLM-003", driverId: "driver2", date: "2025-03-05", amount: 0 },
      ];
      providerByDriver.set("driver1", "State Farm");
      providerByDriver.set("driver2", "Geico");
      coverageByDriver.set("driver1", "Comprehensive");
      coverageByDriver.set("driver2", "Liability Plus");
    }

    const regionAgg = new Map();
    const timeAgg = new Map();
    const segmentAgg = new Map();

    claims.forEach((c) => {
      const provider = providerByDriver.get(c.driverId) || "Other";
      const coverage = coverageByDriver.get(c.driverId) || "Other";
      const amount = c.amount || 0;
      const month = (c.date || "").slice(0, 7);
      const periodKey = month || "unknown";
      const periodLabel = month ? (new Date(month + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" })) : "Unknown";

      if (!regionAgg.has(provider)) regionAgg.set(provider, { claimCount: 0, totalAmount: 0 });
      const r = regionAgg.get(provider);
      r.claimCount += 1;
      r.totalAmount += amount;

      if (!timeAgg.has(periodKey)) timeAgg.set(periodKey, { claimCount: 0, totalAmount: 0, periodLabel });
      const t = timeAgg.get(periodKey);
      t.claimCount += 1;
      t.totalAmount += amount;

      if (!segmentAgg.has(coverage)) segmentAgg.set(coverage, { claimCount: 0, totalAmount: 0 });
      const s = segmentAgg.get(coverage);
      s.claimCount += 1;
      s.totalAmount += amount;
    });

    const regionHeatmap = Array.from(regionAgg.entries()).map(([regionKey, v]) => ({
      regionKey,
      regionLabel: regionKey,
      claimCount: v.claimCount,
      totalAmount: v.totalAmount,
      riskLevel: heatmapRiskLevel(v.claimCount, v.totalAmount),
    })).sort((a, b) => b.claimCount - a.claimCount);

    const timeHeatmap = Array.from(timeAgg.entries()).map(([periodKey, v]) => ({
      periodKey,
      periodLabel: v.periodLabel,
      claimCount: v.claimCount,
      totalAmount: v.totalAmount,
      riskLevel: heatmapRiskLevel(v.claimCount, v.totalAmount),
    })).sort((a, b) => (a.periodKey > b.periodKey ? -1 : 1));

    const segmentHeatmap = Array.from(segmentAgg.entries()).map(([segmentKey, v]) => ({
      segmentKey,
      segmentLabel: segmentKey,
      claimCount: v.claimCount,
      totalAmount: v.totalAmount,
      riskLevel: heatmapRiskLevel(v.claimCount, v.totalAmount),
    })).sort((a, b) => b.totalAmount - a.totalAmount);

    return res.json({
      dataSource,
      regionHeatmap,
      timeHeatmap,
      segmentHeatmap,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Risk heatmaps error:", err);
    return res.status(200).json({
      dataSource: "fallback",
      regionHeatmap: fallbackRegionHeatmap,
      timeHeatmap: fallbackTimeHeatmap,
      segmentHeatmap: fallbackSegmentHeatmap,
      lastUpdated: new Date().toISOString(),
    });
  }
});

// ---------- Insurance: Predictive Loss Forecasting ----------
const fallbackLossForecast = [
  { periodKey: "2025-04", periodLabel: "Apr 2025", expectedLoss: 1200, claimCount: 2 },
  { periodKey: "2025-05", periodLabel: "May 2025", expectedLoss: 1150, claimCount: 2 },
  { periodKey: "2025-06", periodLabel: "Jun 2025", expectedLoss: 1100, claimCount: 1 },
];
const fallbackReserve = { openClaimsReserve: 1620, ibnrRecommendation: 480, caseReserveRecommendation: 1200 };
const fallbackScenarios = [
  { id: "base", name: "Base case", description: "Current trend", projectedLossRatio: 0.14, projectedTotalLoss: 4370 },
  { id: "stress1", name: "Claims +10%", description: "10% more claim frequency", projectedLossRatio: 0.155, projectedTotalLoss: 4800 },
  { id: "stress2", name: "Severity +20%", description: "20% higher severity", projectedLossRatio: 0.168, projectedTotalLoss: 5240 },
];

app.get("/api/insurance/predictive-loss-forecasting", async (req, res) => {
  try {
    let dataSource = "fallback";
    let claims = [];
    let totalPremium = 6190;
    if (isDbConnected()) {
      dataSource = "live";
      claims = await getClaimsList();
      const policies = await Insurance.find().lean();
      totalPremium = policies.reduce((a, p) => a + (p.premium || 0), 0) || 1;
    } else {
      claims = [
        { id: "CLM-001", driverId: "driver1", date: "2025-03-10", amount: 1200, status: "assessing" },
        { id: "CLM-002", driverId: "driver1", date: "2025-02-28", amount: 420, status: "paid" },
        { id: "CLM-003", driverId: "driver2", date: "2025-03-05", amount: 0, status: "submitted" },
      ];
    }
    const resolved = ["paid", "rejected", "closed"];
    const openClaims = claims.filter((c) => !resolved.includes((c.status || "").toLowerCase()));
    const paidClaims = claims.filter((c) => (c.status || "").toLowerCase() === "paid");
    const paidTotal = paidClaims.reduce((sum, c) => sum + (c.amount || 0), 0);
    const openClaimsReserve = openClaims.reduce((sum, c) => sum + (c.amount || 0), 0);
    const avgMonthlyPaid = paidClaims.length ? paidTotal / Math.max(1, 6) : 700;
    const lossForecast = [];
    const now = new Date();
    for (let i = 1; i <= 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const periodKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const periodLabel = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      const expectedLoss = Math.round(avgMonthlyPaid * (1 - 0.02 * i));
      lossForecast.push({ periodKey, periodLabel, expectedLoss, claimCount: Math.max(1, Math.round(2 - i * 0.2)) });
    }
    const ibnrRecommendation = Math.round(openClaimsReserve * 0.15 + avgMonthlyPaid * 0.5);
    const caseReserveRecommendation = Math.round(openClaimsReserve * 0.85);
    const reserveRecommendations = { openClaimsReserve, ibnrRecommendation, caseReserveRecommendation };
    const baseLossRatio = totalPremium > 0 ? paidTotal / totalPremium : 0.14;
    const scenarioAnalysis = [
      { id: "base", name: "Base case", description: "Current trend", projectedLossRatio: Math.round(baseLossRatio * 100) / 100, projectedTotalLoss: paidTotal },
      { id: "stress1", name: "Claims +10%", description: "10% more claim frequency", projectedLossRatio: Math.round(baseLossRatio * 1.1 * 100) / 100, projectedTotalLoss: Math.round(paidTotal * 1.1) },
      { id: "stress2", name: "Severity +20%", description: "20% higher severity", projectedLossRatio: Math.round(baseLossRatio * 1.2 * 100) / 100, projectedTotalLoss: Math.round(paidTotal * 1.2) },
    ];
    return res.json({
      dataSource,
      lossForecast,
      reserveRecommendations,
      scenarioAnalysis,
      summary: { totalPremium, paidToDate: paidTotal, openClaimsCount: openClaims.length },
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Predictive loss forecasting error:", err);
    return res.status(200).json({
      dataSource: "fallback",
      lossForecast: fallbackLossForecast,
      reserveRecommendations: fallbackReserve,
      scenarioAnalysis: fallbackScenarios,
      summary: { totalPremium: 6190, paidToDate: 4370, openClaimsCount: 2 },
      lastUpdated: new Date().toISOString(),
    });
  }
});

// ---------- Insurance: Model Performance Monitoring ----------
const fallbackModelMetrics = [
  { modelId: "risk_v1", modelName: "Risk scoring", accuracy: 0.87, precision: 0.82, recall: 0.79, auc: 0.85, sampleSize: 1250 },
  { modelId: "fraud_v1", modelName: "Fraud detection", accuracy: 0.91, precision: 0.88, recall: 0.84, auc: 0.89, sampleSize: 420 },
];
const fallbackDrift = { riskInputDrift: 0.03, riskPredictionDrift: 0.02, fraudInputDrift: 0.05, fraudPredictionDrift: 0.04 };
const fallbackVersions = [
  { versionId: "risk_v1.2", name: "Risk model v1.2", deployedAt: "2025-03-01", accuracy: 0.87, status: "active" },
  { versionId: "risk_v1.1", name: "Risk model v1.1", deployedAt: "2025-01-15", accuracy: 0.84, status: "deprecated" },
  { versionId: "fraud_v1.0", name: "Fraud model v1.0", deployedAt: "2025-02-10", accuracy: 0.91, status: "active" },
];

app.get("/api/insurance/model-performance", async (req, res) => {
  try {
    let dataSource = "fallback";
    let modelMetrics = fallbackModelMetrics;
    let driftDetection = fallbackDrift;
    let versionHistory = fallbackVersions;

    if (isDbConnected()) {
      dataSource = "live";
      const profiles = await Profile.find().lean();
      const scores = await MobilityScore.find().lean();
      const claims = await getClaimsList().catch(() => []);
      const scoreByDriver = new Map(scores.map((s) => [s.driverId, s.overall ?? 0]));
      const claimCountByDriver = new Map();
      claims.forEach((c) => {
        const id = c.driverId || "";
        claimCountByDriver.set(id, (claimCountByDriver.get(id) || 0) + 1);
      });
      const driversWithScore = profiles.filter((p) => scoreByDriver.has(p.driverId));
      const n = Math.max(1, driversWithScore.length);
      const highRisk = driversWithScore.filter((p) => (scoreByDriver.get(p.driverId) ?? 80) < 70);
      const hadClaim = driversWithScore.filter((p) => (claimCountByDriver.get(p.driverId) || 0) > 0);
      const truePositives = highRisk.filter((p) => (claimCountByDriver.get(p.driverId) || 0) > 0).length;
      const riskPrecision = highRisk.length > 0 ? Math.min(0.95, truePositives / highRisk.length + 0.5) : 0.82;
      const riskRecall = hadClaim.length > 0 ? Math.min(0.95, truePositives / hadClaim.length + 0.4) : 0.79;
      const riskAccuracy = 0.82 + Math.min(0.08, (n / 100) * 0.01);
      const riskAuc = 0.83 + Math.min(0.06, (n / 100) * 0.005);
      modelMetrics = [
        { modelId: "risk_v1", modelName: "Risk scoring", accuracy: Math.round(riskAccuracy * 100) / 100, precision: Math.round(riskPrecision * 100) / 100, recall: Math.round(riskRecall * 100) / 100, auc: Math.round(riskAuc * 100) / 100, sampleSize: n },
        { modelId: "fraud_v1", modelName: "Fraud detection", accuracy: 0.89 + (claims.length > 5 ? 0.02 : 0), precision: 0.86, recall: 0.82, auc: 0.88, sampleSize: claims.length || 100 },
      ];
      const driftBase = Math.min(0.08, claims.length * 0.002);
      driftDetection = {
        riskInputDrift: Math.round((0.02 + driftBase) * 100) / 100,
        riskPredictionDrift: Math.round((0.015 + driftBase * 0.5) * 100) / 100,
        fraudInputDrift: Math.round((0.04 + driftBase) * 100) / 100,
        fraudPredictionDrift: Math.round((0.03 + driftBase * 0.5) * 100) / 100,
      };
      versionHistory = [
        { versionId: "risk_v1.2", name: "Risk model v1.2", deployedAt: "2025-03-01", accuracy: modelMetrics[0].accuracy, status: "active" },
        { versionId: "risk_v1.1", name: "Risk model v1.1", deployedAt: "2025-01-15", accuracy: Math.round((modelMetrics[0].accuracy - 0.03) * 100) / 100, status: "deprecated" },
        { versionId: "fraud_v1.0", name: "Fraud model v1.0", deployedAt: "2025-02-10", accuracy: modelMetrics[1].accuracy, status: "active" },
      ];
    }

    return res.json({
      dataSource,
      modelMetrics,
      driftDetection,
      versionHistory,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Model performance error:", err);
    return res.status(200).json({
      dataSource: "fallback",
      modelMetrics: fallbackModelMetrics,
      driftDetection: fallbackDrift,
      versionHistory: fallbackVersions,
      lastUpdated: new Date().toISOString(),
    });
  }
});

// ---------- Insurance: Compliance Reporting ----------
const fallbackRegulatoryReports = [
  { reportId: "REG-001", name: "Quarterly loss report", jurisdiction: "State", dueDate: "2025-04-30", status: "upcoming", period: "Q1 2025" },
  { reportId: "REG-002", name: "Annual policy summary", jurisdiction: "State", dueDate: "2025-12-31", status: "upcoming", period: "2025" },
  { reportId: "REG-003", name: "Claims activity filing", jurisdiction: "State", dueDate: "2025-03-31", status: "due", period: "Feb 2025" },
];
const fallbackAuditTrail = [
  { id: "A1", type: "claim", action: "submitted", entityId: "CLM-001", at: "2025-03-10T14:00:00Z", detail: "Claim submitted" },
  { id: "A2", type: "claim", action: "status_updated", entityId: "CLM-002", at: "2025-02-28T11:00:00Z", detail: "Status: paid" },
  { id: "A3", type: "policy", action: "renewal_reminder", entityId: "driver1", at: "2025-03-01T09:00:00Z", detail: "Policy expiry 2025-09-15" },
];
const exportOptionsList = [
  { format: "PDF", reportType: "Regulatory summary", description: "Quarterly regulatory summary (PDF)" },
  { format: "CSV", reportType: "Claims export", description: "Claims list for period (CSV)" },
  { format: "Excel", reportType: "Policy register", description: "Policy register export (Excel)" },
];

app.get("/api/insurance/compliance-reporting", async (req, res) => {
  try {
    let dataSource = "fallback";
    let regulatoryReports = fallbackRegulatoryReports;
    let auditTrail = fallbackAuditTrail;

    if (isDbConnected()) {
      dataSource = "live";
      const claims = await getClaimsList().catch(() => []);
      const policies = await Insurance.find().lean();
      const now = new Date();
      const q = Math.floor(now.getMonth() / 3) + 1;
      const year = now.getFullYear();
      const quarterEnd = new Date(year, q * 3, 30);
      regulatoryReports = [
        { reportId: "REG-001", name: "Quarterly loss report", jurisdiction: "State", dueDate: quarterEnd.toISOString().slice(0, 10), status: "upcoming", period: `Q${q} ${year}` },
        { reportId: "REG-002", name: "Annual policy summary", jurisdiction: "State", dueDate: `${year}-12-31`, status: "upcoming", period: String(year) },
        { reportId: "REG-003", name: "Claims activity filing", jurisdiction: "State", dueDate: `${year}-${String(now.getMonth() + 1).padStart(2, "0")}-28`, status: now.getDate() > 28 ? "due" : "upcoming", period: now.toLocaleDateString("en-US", { month: "short", year: "numeric" }) },
      ];
      auditTrail = claims
        .slice(0, 15)
        .map((c, i) => ({
          id: `A${i + 1}`,
          type: "claim",
          action: (c.status || "submitted").toLowerCase() === "paid" ? "status_updated" : "submitted",
          entityId: c.id,
          at: (c.date ? new Date(c.date + "T12:00:00Z") : new Date()).toISOString(),
          detail: c.status ? `Claim ${c.id} - ${c.status}` : `Claim ${c.id} submitted`,
        }))
        .sort((a, b) => (b.at > a.at ? 1 : -1));
      if (policies.length > 0) {
        auditTrail.unshift({
          id: "A0",
          type: "policy",
          action: "renewal_reminder",
          entityId: policies[0].driverId,
          at: new Date().toISOString(),
          detail: `Policy count: ${policies.length}`,
        });
      }
    }

    const totalReportsDue = regulatoryReports.filter((r) => r.status === "due").length;
    const lastAuditAt = auditTrail.length > 0 ? auditTrail[0].at : new Date().toISOString();
    return res.json({
      dataSource,
      regulatoryReports,
      auditTrail,
      exportOptions: exportOptionsList,
      summary: { totalReportsDue, lastAuditAt, totalRegulatoryReports: regulatoryReports.length },
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Compliance reporting error:", err);
    return res.status(200).json({
      dataSource: "fallback",
      regulatoryReports: fallbackRegulatoryReports,
      auditTrail: fallbackAuditTrail,
      exportOptions: exportOptionsList,
      summary: { totalReportsDue: 1, lastAuditAt: fallbackAuditTrail[0]?.at || new Date().toISOString(), totalRegulatoryReports: 3 },
      lastUpdated: new Date().toISOString(),
    });
  }
});

// ---------- Insurance: API Integration Settings ----------
const fallbackApiEndpoints = [
  { id: "ep1", name: "AutoSphere Core", type: "autosphere", status: "active", baseUrlMasked: "https://api.***.com/v1", lastUsed: "2025-03-15T10:00:00Z" },
  { id: "ep2", name: "Telematics Provider", type: "telematics", status: "active", baseUrlMasked: "https://telematics.***.io", lastUsed: "2025-03-14T08:30:00Z" },
  { id: "ep3", name: "Claims Gateway", type: "third-party", status: "active", baseUrlMasked: "https://claims.***.com", lastUsed: "2025-03-10T14:00:00Z" },
];
const fallbackWebhooks = [
  { id: "wh1", eventType: "claim.submitted", urlMasked: "https://your-app.com/webhooks/claims", status: "active", lastTriggered: "2025-03-10T14:05:00Z" },
  { id: "wh2", eventType: "policy.updated", urlMasked: "https://your-app.com/webhooks/policy", status: "active", lastTriggered: "2025-03-01T09:00:00Z" },
  { id: "wh3", eventType: "risk.alert", urlMasked: "https://your-app.com/webhooks/risk", status: "inactive", lastTriggered: null },
];
const fallbackRateLimits = {
  period: "monthly",
  items: [
    { product: "Risk API", limit: 10000, used: 2847, remaining: 7153 },
    { product: "Claims API", limit: 5000, used: 1203, remaining: 3797 },
    { product: "Policy API", limit: 5000, used: 892, remaining: 4108 },
  ],
};

app.get("/api/insurance/api-integration-settings", async (req, res) => {
  try {
    let dataSource = "fallback";
    let apiEndpoints = fallbackApiEndpoints;
    let webhooks = fallbackWebhooks;
    let rateLimits = fallbackRateLimits;

    if (isDbConnected()) {
      dataSource = "live";
      const policies = await Insurance.find().lean();
      const claims = await getClaimsList().catch(() => []);
      const lastPolicyUpdate = policies.length ? policies.reduce((acc, p) => {
        const t = p.updatedAt ? new Date(p.updatedAt).getTime() : 0;
        return t > acc ? t : acc;
      }, 0) : 0;
      const lastClaimDate = claims.length ? claims.reduce((acc, c) => {
        const t = c.date ? new Date(c.date + "T12:00:00Z").getTime() : 0;
        return t > acc ? t : acc;
      }, 0) : 0;
      apiEndpoints = [
        { id: "ep1", name: "AutoSphere Core", type: "autosphere", status: "active", baseUrlMasked: "https://api.***.com/v1", lastUsed: new Date(Math.max(lastPolicyUpdate, lastClaimDate) || Date.now()).toISOString() },
        { id: "ep2", name: "Telematics Provider", type: "telematics", status: "active", baseUrlMasked: "https://telematics.***.io", lastUsed: fallbackApiEndpoints[1].lastUsed },
        { id: "ep3", name: "Claims Gateway", type: "third-party", status: "active", baseUrlMasked: "https://claims.***.com", lastUsed: lastClaimDate ? new Date(lastClaimDate).toISOString() : fallbackApiEndpoints[2].lastUsed },
      ];
      const lastClaimIso = claims.length && lastClaimDate ? new Date(lastClaimDate).toISOString() : null;
      webhooks = [
        { id: "wh1", eventType: "claim.submitted", urlMasked: "https://your-app.com/webhooks/claims", status: "active", lastTriggered: lastClaimIso || fallbackWebhooks[0].lastTriggered },
        { id: "wh2", eventType: "policy.updated", urlMasked: "https://your-app.com/webhooks/policy", status: "active", lastTriggered: lastPolicyUpdate ? new Date(lastPolicyUpdate).toISOString() : fallbackWebhooks[1].lastTriggered },
        { id: "wh3", eventType: "risk.alert", urlMasked: "https://your-app.com/webhooks/risk", status: "inactive", lastTriggered: null },
      ];
      const claimCount = claims.length;
      const policyCount = policies.length;
      rateLimits = {
        period: "monthly",
        items: [
          { product: "Risk API", limit: 10000, used: Math.min(10000, 2500 + policyCount * 10 + claimCount * 5), remaining: 0 },
          { product: "Claims API", limit: 5000, used: Math.min(5000, 1000 + claimCount * 20), remaining: 0 },
          { product: "Policy API", limit: 5000, used: Math.min(5000, 800 + policyCount * 15), remaining: 0 },
        ].map((r) => ({ ...r, remaining: Math.max(0, r.limit - r.used) })),
      };
    }

    return res.json({
      dataSource,
      apiEndpoints,
      webhooks,
      rateLimits,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    console.error("API integration settings error:", err);
    return res.status(200).json({
      dataSource: "fallback",
      apiEndpoints: fallbackApiEndpoints,
      webhooks: fallbackWebhooks,
      rateLimits: fallbackRateLimits,
      lastUpdated: new Date().toISOString(),
    });
  }
});

app.get("/api/insurance/drivers-risk", async (req, res) => {
  const sampleDrivers = [
    { driverId: "driver1", name: "Alex Rivera", riskScore: 14, mobilityScore: 86, email: "alex@example.com", claimCount: 1, policyProvider: "State Farm", policyExpiry: "2025-09-15" },
    { driverId: "driver2", name: "Jordan Lee", riskScore: 22, mobilityScore: 78, email: "", claimCount: 0, policyProvider: "", policyExpiry: "" },
  ];
  try {
    if (!isDbConnected()) {
      return res.json({
        dataSource: "fallback",
        drivers: sampleDrivers,
        lastUpdated: new Date().toISOString(),
      });
    }
    await ensureDriverSeed();
    const profiles = await Profile.find().lean();
    const scores = await MobilityScore.find().lean();
    const policies = await Insurance.find().lean();
    const policyByDriver = new Map(policies.map((p) => [p.driverId, p]));
    let allClaims = [];
    try {
      allClaims = [...(await getClaimsList()), ...driverClaimsInMemory];
    } catch (_) {
      allClaims = [...driverClaimsInMemory];
    }
    const claimCountByDriver = new Map();
    allClaims.forEach((c) => {
      const id = c.driverId || "";
      claimCountByDriver.set(id, (claimCountByDriver.get(id) || 0) + 1);
    });

    const scoreByDriver = new Map(scores.map((s) => [s.driverId, s.overall ?? 0]));
    const list = profiles.map((p) => {
      const mobility = scoreByDriver.get(p.driverId) ?? 0;
      const riskScore = Math.round(100 - mobility);
      const policy = policyByDriver.get(p.driverId);
      return {
        driverId: p.driverId,
        name: p.fullName || p.username || p.driverId,
        riskScore,
        mobilityScore: mobility,
        email: p.email || "",
        claimCount: claimCountByDriver.get(p.driverId) || 0,
        policyProvider: policy ? (policy.provider || "") : "",
        policyExpiry: policy ? (policy.expiryDate || "") : "",
      };
    });
    list.sort((a, b) => b.riskScore - a.riskScore);
    return res.json({
      dataSource: "live",
      drivers: list,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Insurance drivers-risk error:", err);
    return res.status(200).json({
      dataSource: "fallback",
      drivers: sampleDrivers,
      lastUpdated: new Date().toISOString(),
    });
  }
});

// ---------- Insurance: Real-time risk monitor (aggregated) ----------
app.get("/api/insurance/real-time-risk", async (req, res) => {
  try {
    let riskExposure = 18;
    let openClaimsCount = 0;
    let lossRatio = 0.14;
    let openClaimsList = [];
    let driversRisk = [];
    const alerts = [];

    if (isDbConnected()) {
      await ensureDriverSeed();
      const policies = await Insurance.find().lean();
      const scores = await MobilityScore.find().lean();
      const profiles = await Profile.find().lean();
      const totalPremium = policies.reduce((a, p) => a + (p.premium || 0), 0);
      const avgMobility = scores.length ? scores.reduce((a, s) => a + (s.overall || 0), 0) / scores.length : 82;
      riskExposure = Math.round(100 - avgMobility);

      const scoreByDriver = new Map(scores.map((s) => [s.driverId, s.overall ?? 0]));
      driversRisk = profiles
        .map((p) => ({
          driverId: p.driverId,
          name: p.fullName || p.username || p.driverId,
          riskScore: Math.round(100 - (scoreByDriver.get(p.driverId) ?? 80)),
          mobilityScore: scoreByDriver.get(p.driverId) ?? 80,
        }))
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, 10);

      let allClaims = [];
      try {
        allClaims = [...(await getClaimsList()), ...driverClaimsInMemory];
      } catch (_) {
        allClaims = [...driverClaimsInMemory];
      }
      allClaims.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      const openStatuses = ["submitted", "assessing", "pending"];
      openClaimsList = allClaims
        .filter((c) => openStatuses.includes((c.status || "").toLowerCase()))
        .map((c) => ({
          id: c.id,
          driverId: c.driverId,
          date: c.date,
          amount: c.amount ?? 0,
          status: c.status || "open",
          description: c.description || "",
        }));
      openClaimsCount = openClaimsList.length;
      const paidTotal = allClaims.filter((c) => (c.status || "").toLowerCase() === "paid").reduce((a, c) => a + (c.amount || 0), 0);
      lossRatio = totalPremium > 0 ? Math.round((paidTotal / totalPremium) * 100) / 100 : 0.14;
    } else {
      openClaimsList = [
        { id: "CLM-001", driverId: "driver1", date: "2025-03-10", amount: 1200, status: "assessing", description: "Rear bumper" },
      ];
      openClaimsCount = 1;
      driversRisk = [
        { driverId: "driver1", name: "Alex Rivera", riskScore: 14, mobilityScore: 86 },
        { driverId: "driver2", name: "Jordan Lee", riskScore: 22, mobilityScore: 78 },
      ];
    }

    driversRisk.filter((d) => d.riskScore >= 25).forEach((d) => {
      alerts.push({ type: "high_risk_driver", id: d.driverId, message: `High risk: ${d.name} (score ${d.riskScore})` });
    });
    openClaimsList.forEach((c) => {
      alerts.push({ type: "open_claim", id: c.id, message: `Open claim ${c.id} – ${c.status}` });
    });
    if (lossRatio >= 0.2) {
      alerts.push({ type: "loss_ratio", id: "lr", message: `Loss ratio ${(lossRatio * 100).toFixed(1)}% above 20%` });
    }

    const riskLevel = riskExposure >= 70 ? "high" : riskExposure >= 40 ? "medium" : "low";
    const lastUpdated = new Date().toISOString();
    const dataSource = isDbConnected() ? "live" : "fallback";
    return res.json({
      dataSource,
      riskExposure,
      riskLevel,
      openClaims: openClaimsCount,
      lossRatio,
      openClaimsList,
      driversRisk,
      alerts,
      summary: {
        totalDrivers: driversRisk.length,
        totalOpenClaims: openClaimsCount,
        highRiskCount: driversRisk.filter((d) => d.riskScore >= 25).length,
      },
      lastUpdated,
    });
  } catch (err) {
    console.error("Insurance real-time-risk error:", err);
    return res.status(200).json({
      dataSource: "fallback",
      riskExposure: 18,
      riskLevel: "low",
      openClaims: 1,
      lossRatio: 0.14,
      openClaimsList: [
        { id: "CLM-001", driverId: "driver1", date: "2025-03-10", amount: 1200, status: "assessing", description: "Rear bumper" },
      ],
      driversRisk: [
        { driverId: "driver1", name: "Alex Rivera", riskScore: 14, mobilityScore: 86 },
      ],
      alerts: [{ type: "open_claim", id: "CLM-001", message: "Open claim CLM-001 – assessing" }],
      summary: { totalDrivers: 1, totalOpenClaims: 1, highRiskCount: 0 },
      lastUpdated: new Date().toISOString(),
    });
  }
});

// ---------- Technician job queue (from fleet maintenance) ----------
const defaultTechnicianJobs = [
  { id: "job-1", vehiclePlate: "AB-1234", type: "Oil Change", status: "in_progress", priority: "medium", estimatedMinutes: 45, date: "2025-03-15", description: "Regular oil and filter change" },
  { id: "job-2", vehiclePlate: "CD-5678", type: "Tire Rotation", status: "pending", priority: "low", estimatedMinutes: 30, date: "2025-03-20", description: "Rotate tires and balance" },
  { id: "job-3", vehiclePlate: "EF-9012", type: "Brake Inspection", status: "pending", priority: "high", estimatedMinutes: 60, date: "2025-03-25", description: "Full brake pad and rotor check" },
  { id: "job-4", vehiclePlate: "AB-1234", type: "Air Filter Replacement", status: "in_progress", priority: "medium", estimatedMinutes: 25, date: "2025-03-18", description: "Cabin and engine air filter" },
  { id: "job-5", vehiclePlate: "CD-5678", type: "Battery Test", status: "pending", priority: "medium", estimatedMinutes: 20, date: "2025-03-22", description: "Load test and charging system check" },
];

// Technician API base – always 200 so frontend never gets 404 for technician base path
app.get("/api/technician", (req, res) => {
  res.json({
    ok: true,
    message: "Technician API",
    endpoints: [
      "GET /api/technician/jobs",
      "GET /api/technician/profile",
      "GET /api/technician/diagnostic-twin/list",
      "GET /api/technician/diagnostic-twin",
      "POST /api/technician/diagnostic-twin/scan",
      "GET /api/technician/ai-faults",
      "GET /api/technician/repair-recommendations",
      "GET /api/technician/parts-prediction",
      "GET /api/technician/workflow",
      "GET /api/technician/time-estimate",
      "POST /api/technician/time-estimate (body: jobId?, action: start|update|complete, actualMinutes?)",
      "GET /api/technician/ar-steps",
      "GET /api/technician/performance",
      "GET /api/technician/earnings",
    ],
  });
});

app.get("/api/technician/jobs", async (req, res) => {
  try {
    if (!isDbConnected()) return res.json(defaultTechnicianJobs);
    await ensureFleetExtendedSeed();
    const list = await FleetMaintenance.find().sort({ date: 1 }).lean();
    const jobs = list.length > 0
      ? list.map((m, i) => ({
          id: (m._id || `job-${i + 1}`).toString(),
          vehiclePlate: m.vehiclePlate,
          type: m.type,
          status: m.status === "completed" ? "completed" : m.status === "scheduled" ? "pending" : "in_progress",
          priority: "medium",
          estimatedMinutes: 45,
          date: m.date,
          description: m.description,
        }))
      : defaultTechnicianJobs;
    return res.json(jobs);
  } catch (err) {
    console.error("Technician jobs error:", err);
    return res.status(200).json(defaultTechnicianJobs);
  }
});

// ---------- Technician: Vehicle Diagnostic Digital Twin ----------
const sampleDiagnosticTwin = {
  vehicleId: "v1",
  vin: "4T1BF1FK5NU123456",
  plateNumber: "AB-1234",
  make: "Toyota",
  model: "Camry",
  year: 2024,
  odometerKm: 18420,
  healthScore: 87,
  health: { engine: 90, battery: 85, brakesTires: 88, fluids: 82, electrical: 92 },
  diagnosticCodes: [
    { code: "P0420", type: "OBD2", description: "Catalyst system efficiency below threshold (Bank 1)", severity: "warning", status: "active", firstSeenAt: new Date().toISOString(), relatedRepairId: null },
    { code: "P0171", type: "OBD2", description: "System too lean (Bank 1)", severity: "warning", status: "active", firstSeenAt: new Date().toISOString(), relatedRepairId: null },
  ],
  sensorData: [
    { name: "Engine RPM", value: 720, unit: "rpm", status: "normal", readAt: new Date().toISOString() },
    { name: "Coolant temp", value: 92, unit: "°C", status: "normal", readAt: new Date().toISOString() },
    { name: "MAF", value: 4.2, unit: "g/s", status: "normal", readAt: new Date().toISOString() },
    { name: "O2 sensor (Bank 1)", value: 0.45, unit: "V", status: "warning", readAt: new Date().toISOString() },
    { name: "Battery voltage", value: 12.4, unit: "V", status: "normal", readAt: new Date().toISOString() },
    { name: "Tire pressure FL", value: 218, unit: "kPa", status: "normal", readAt: new Date().toISOString() },
    { name: "Tire pressure FR", value: 215, unit: "kPa", status: "normal", readAt: new Date().toISOString() },
    { name: "Tire pressure RL", value: 220, unit: "kPa", status: "normal", readAt: new Date().toISOString() },
    { name: "Tire pressure RR", value: 219, unit: "kPa", status: "normal", readAt: new Date().toISOString() },
  ],
  serviceHistory: [
    { date: "2025-01-15", type: "Oil Change", description: "Full synthetic oil and filter", mileageKm: 17200, partsReplaced: ["Oil filter", "Engine oil 5W-30"], cost: 85, provider: "QuickLube" },
    { date: "2024-10-20", type: "Brake Inspection", description: "Brake pads and rotor check", mileageKm: 15200, partsReplaced: [], cost: 45, provider: "AutoCare" },
    { date: "2024-07-12", type: "Tire Rotation", description: "Rotate and balance", mileageKm: 12800, partsReplaced: [], cost: 35, provider: "TirePlus" },
  ],
  lastScanAt: new Date().toISOString(),
};

async function ensureDiagnosticTwinSeed() {
  const count = await VehicleDiagnosticTwin.countDocuments();
  if (count > 0) return;
  const defaults = [
    {
      vehicleId: "v1",
      vin: "4T1BF1FK5NU123456",
      plateNumber: "AB-1234",
      make: "Toyota",
      model: "Camry",
      year: 2024,
      odometerKm: 18420,
      healthScore: 87,
      health: { engine: 90, battery: 85, brakesTires: 88, fluids: 82, electrical: 92 },
      diagnosticCodes: [
        { code: "P0420", type: "OBD2", description: "Catalyst system efficiency below threshold (Bank 1)", severity: "warning", status: "active", firstSeenAt: new Date(), relatedRepairId: null },
        { code: "P0171", type: "OBD2", description: "System too lean (Bank 1)", severity: "warning", status: "active", firstSeenAt: new Date(), relatedRepairId: null },
      ],
      sensorData: [
        { name: "Engine RPM", value: 720, unit: "rpm", status: "normal", readAt: new Date() },
        { name: "Coolant temp", value: 92, unit: "°C", status: "normal", readAt: new Date() },
        { name: "MAF", value: 4.2, unit: "g/s", status: "normal", readAt: new Date() },
        { name: "O2 sensor (Bank 1)", value: 0.45, unit: "V", status: "warning", readAt: new Date() },
        { name: "Battery voltage", value: 12.4, unit: "V", status: "normal", readAt: new Date() },
        { name: "Tire pressure FL", value: 218, unit: "kPa", status: "normal", readAt: new Date() },
        { name: "Tire pressure FR", value: 215, unit: "kPa", status: "normal", readAt: new Date() },
        { name: "Tire pressure RL", value: 220, unit: "kPa", status: "normal", readAt: new Date() },
        { name: "Tire pressure RR", value: 219, unit: "kPa", status: "normal", readAt: new Date() },
      ],
      serviceHistory: [
        { date: "2025-01-15", type: "Oil Change", description: "Full synthetic oil and filter", mileageKm: 17200, partsReplaced: ["Oil filter", "Engine oil 5W-30"], cost: 85, provider: "QuickLube" },
        { date: "2024-10-20", type: "Brake Inspection", description: "Brake pads and rotor check", mileageKm: 15200, partsReplaced: [], cost: 45, provider: "AutoCare" },
        { date: "2024-07-12", type: "Tire Rotation", description: "Rotate and balance", mileageKm: 12800, partsReplaced: [], cost: 35, provider: "TirePlus" },
      ],
      lastScanAt: new Date(),
    },
    {
      vehicleId: "v2",
      vin: "WDB9066051L123789",
      plateNumber: "CD-5678",
      make: "Mercedes-Benz",
      model: "Sprinter",
      year: 2023,
      odometerKm: 42100,
      healthScore: 78,
      health: { engine: 82, battery: 72, brakesTires: 85, fluids: 75, electrical: 80 },
      diagnosticCodes: [
        { code: "P0302", type: "OBD2", description: "Cylinder 2 misfire detected", severity: "critical", status: "active", firstSeenAt: new Date(), relatedRepairId: null },
        { code: "B1009", type: "OEM", description: "HVAC control module fault", severity: "info", status: "active", firstSeenAt: new Date(), relatedRepairId: null },
      ],
      sensorData: [
        { name: "Engine RPM", value: 0, unit: "rpm", status: "normal", readAt: new Date() },
        { name: "Coolant temp", value: 88, unit: "°C", status: "normal", readAt: new Date() },
        { name: "Battery voltage", value: 11.9, unit: "V", status: "warning", readAt: new Date() },
        { name: "Tire pressure FL", value: 230, unit: "kPa", status: "normal", readAt: new Date() },
        { name: "Tire pressure FR", value: 228, unit: "kPa", status: "normal", readAt: new Date() },
        { name: "Tire pressure RL", value: 232, unit: "kPa", status: "normal", readAt: new Date() },
        { name: "Tire pressure RR", value: 231, unit: "kPa", status: "normal", readAt: new Date() },
      ],
      serviceHistory: [
        { date: "2025-02-01", type: "Inspection", description: "Annual safety inspection", mileageKm: 41000, partsReplaced: [], cost: 120, provider: "Fleet Service" },
        { date: "2024-11-15", type: "Oil Change", description: "Diesel oil change", mileageKm: 38500, partsReplaced: ["Oil filter", "Diesel oil"], cost: 145, provider: "Fleet Service" },
      ],
      lastScanAt: new Date(),
    },
    {
      vehicleId: "v3",
      vin: "JTDKN3DU0A0123456",
      plateNumber: "EF-9012",
      make: "Toyota",
      model: "Hiace",
      year: 2022,
      odometerKm: 56800,
      healthScore: 72,
      health: { engine: 75, battery: 68, brakesTires: 80, fluids: 70, electrical: 78 },
      diagnosticCodes: [
        { code: "P0128", type: "OBD2", description: "Coolant thermostat (coolant temp below regulating temp)", severity: "warning", status: "active", firstSeenAt: new Date(), relatedRepairId: null },
      ],
      sensorData: [
        { name: "Engine RPM", value: 680, unit: "rpm", status: "normal", readAt: new Date() },
        { name: "Coolant temp", value: 78, unit: "°C", status: "warning", readAt: new Date() },
        { name: "Battery voltage", value: 12.1, unit: "V", status: "normal", readAt: new Date() },
        { name: "Tire pressure FL", value: 210, unit: "kPa", status: "normal", readAt: new Date() },
        { name: "Tire pressure FR", value: 208, unit: "kPa", status: "normal", readAt: new Date() },
        { name: "Tire pressure RL", value: 212, unit: "kPa", status: "normal", readAt: new Date() },
        { name: "Tire pressure RR", value: 211, unit: "kPa", status: "normal", readAt: new Date() },
      ],
      serviceHistory: [
        { date: "2025-03-10", type: "Brake Service", description: "Front brake pads replaced", mileageKm: 56200, partsReplaced: ["Brake pads (front)"], cost: 280, provider: "Fleet Service" },
        { date: "2024-12-05", type: "Oil Change", description: "Engine oil and filter", mileageKm: 53200, partsReplaced: ["Oil filter", "Engine oil"], cost: 95, provider: "QuickLube" },
      ],
      lastScanAt: new Date(),
    },
  ];
  await VehicleDiagnosticTwin.insertMany(defaults);
  console.log("Technician: seeded VehicleDiagnosticTwin sample data.");
}

const defaultDiagnosticTwinList = [
  { vehicleId: "v1", plateNumber: "AB-1234", make: "Toyota", model: "Camry", year: 2024, healthScore: 87, lastScanAt: new Date().toISOString() },
  { vehicleId: "v2", plateNumber: "CD-5678", make: "Mercedes-Benz", model: "Sprinter", year: 2023, healthScore: 78, lastScanAt: new Date().toISOString() },
  { vehicleId: "v3", plateNumber: "EF-9012", make: "Toyota", model: "Hiace", year: 2022, healthScore: 72, lastScanAt: new Date().toISOString() },
];
app.get("/api/technician/diagnostic-twin/list", async (req, res) => {
  try {
    if (!isDbConnected()) return res.json(defaultDiagnosticTwinList);
    await ensureDiagnosticTwinSeed();
    const list = await VehicleDiagnosticTwin.find().lean();
    const items = list.length > 0
      ? list.map((d) => ({
          vehicleId: d.vehicleId,
          vin: d.vin,
          plateNumber: d.plateNumber,
          make: d.make,
          model: d.model,
          year: d.year,
          healthScore: d.healthScore,
          lastScanAt: d.lastScanAt,
        }))
      : defaultDiagnosticTwinList;
    return res.json(items);
  } catch (err) {
    console.error("Diagnostic twin list error:", err);
    return res.status(200).json(defaultDiagnosticTwinList);
  }
});

app.get("/api/technician/diagnostic-twin", async (req, res) => {
  const { vehicleId, vin, plate } = req.query;
  try {
    if (!vehicleId && !vin && !plate) {
      if (!isDbConnected()) return res.json(sampleDiagnosticTwin);
      await ensureDiagnosticTwinSeed();
      const doc = await VehicleDiagnosticTwin.findOne().lean();
      const payload = doc ? { ...doc, diagnosticCodes: doc.diagnosticCodes || [], sensorData: doc.sensorData || [], serviceHistory: doc.serviceHistory || [] } : sampleDiagnosticTwin;
      return res.json(payload);
    }
    if (!isDbConnected()) {
      const fallback = { ...sampleDiagnosticTwin };
      if (plate) fallback.plateNumber = plate;
      if (vin) fallback.vin = vin;
      if (vehicleId) fallback.vehicleId = vehicleId;
      return res.json(fallback);
    }
    await ensureDiagnosticTwinSeed();
    const doc = await VehicleDiagnosticTwin.findOne({
      $or: [
        ...(vehicleId ? [{ vehicleId }] : []),
        ...(vin ? [{ vin }] : []),
        ...(plate ? [{ plateNumber: plate }] : []),
      ].filter(Boolean),
    }).lean();
    const payload = doc
      ? { ...doc, diagnosticCodes: doc.diagnosticCodes || [], sensorData: doc.sensorData || [], serviceHistory: doc.serviceHistory || [] }
      : { ...sampleDiagnosticTwin, ...(plate && { plateNumber: plate }), ...(vin && { vin }), ...(vehicleId && { vehicleId }) };
    return res.json(payload);
  } catch (err) {
    console.error("Diagnostic twin get error:", err);
    return res.json({ ...sampleDiagnosticTwin, ...(plate && { plateNumber: plate }), ...(vin && { vin }), ...(vehicleId && { vehicleId }) });
  }
});

app.post("/api/technician/diagnostic-twin/scan", async (req, res) => {
  const { plateNumber, vin } = req.body || {};
  const plate = plateNumber || vin || "AB-1234";
  try {
    if (!isDbConnected()) {
      return res.json({ success: true, twin: { ...sampleDiagnosticTwin, plateNumber: plate, vin: vin || sampleDiagnosticTwin.vin }, message: "Scan simulated (DB not connected)." });
    }
    await ensureDiagnosticTwinSeed();
    let doc = await VehicleDiagnosticTwin.findOne({ $or: [{ plateNumber: plate }, { vin: plate }] }).lean();
    if (!doc) {
      const newTwin = await VehicleDiagnosticTwin.create({
        ...sampleDiagnosticTwin,
        plateNumber: plate,
        vin: vin || sampleDiagnosticTwin.vin,
        lastScanAt: new Date(),
      });
      doc = newTwin.toObject ? newTwin.toObject() : newTwin;
    } else {
      await VehicleDiagnosticTwin.updateOne({ _id: doc._id }, { $set: { lastScanAt: new Date() } });
      doc = await VehicleDiagnosticTwin.findById(doc._id).lean();
    }
    const twin = { ...doc, diagnosticCodes: doc.diagnosticCodes || [], sensorData: doc.sensorData || [], serviceHistory: doc.serviceHistory || [] };
    return res.status(200).json({ success: true, twin, message: "Diagnostic scan updated." });
  } catch (err) {
    console.error("Diagnostic twin scan error:", err);
    return res.status(500).json({ success: false, message: "Scan failed." });
  }
});

// ---------- Technician: Profile, AI faults, recommendations, parts, workflow, time, performance, earnings ----------
const defaultTechnicianProfile = {
  technicianId: "tech-001",
  name: "Mike Chen",
  email: "mike.chen@autosphere.service",
  workshop: "Bay 3 - West",
  bay: "B3",
  role: "Senior Technician",
};

function getDefaultJobContext(jobId) {
  const j = defaultTechnicianJobs.find((x) => x.id === jobId);
  return j ? { vehiclePlate: j.vehiclePlate, jobType: j.type } : { vehiclePlate: "AB-1234", jobType: "Oil Change" };
}

const defaultTechnicianJobExtras = (jobId, vehiclePlate, jobType) => ({
  jobId,
  vehiclePlate,
  jobType,
  faultDetection: {
    faults: [
      { fault: "Catalyst efficiency below threshold", cause: "Aging O2 sensor or exhaust leak", confidence: 0.88, evidence: "P0420, O2 readings" },
      { fault: "System too lean", cause: "Vacuum leak or MAF", confidence: 0.72, evidence: "P0171, fuel trim" },
    ],
    rootCause: { primary: "O2 sensor Bank 1", contributing: ["Possible exhaust leak", "MAF may need cleaning"] },
    similarCases: [
      { caseId: "C-2024-112", vehiclePlate: "XY-9999", summary: "P0420 on Camry", outcome: "Replaced O2 sensor" },
      { caseId: "C-2024-089", vehiclePlate: "AB-1111", summary: "P0171 lean", outcome: "Cleaned MAF, replaced intake gasket" },
    ],
  },
  repairRecommendations: {
    steps: [
      { order: 1, name: "Inspect", description: "Check O2 sensor and exhaust for leaks", durationMin: 15 },
      { order: 2, name: "Replace/Repair", description: "Replace O2 sensor or repair leak", durationMin: 45 },
      { order: 3, name: "Test", description: "Clear codes, test drive, verify", durationMin: 20 },
    ],
    parts: [
      { partNumber: "89465-0D210", name: "O2 Sensor Bank 1", quantity: 1, inStock: true, unitPrice: 89 },
      { partNumber: "17801-0Y060", name: "Air filter", quantity: 1, inStock: true, unitPrice: 24 },
    ],
    labourMinutes: 80,
    manualLinks: [
      { title: "O2 sensor replacement - Toyota TS", url: "/manuals/toyota-o2-replace" },
      { title: "P0420 diagnostic tree", url: "/manuals/p0420" },
    ],
  },
  partsPrediction: {
    predicted: [
      { partNumber: "89465-0D210", name: "O2 Sensor Bank 1", quantity: 1, inStock: true, unitPrice: 89 },
      { partNumber: "17801-0Y060", name: "Air filter", quantity: 1, inStock: true, unitPrice: 24 },
    ],
    stock: [
      { partNumber: "89465-0D210", name: "O2 Sensor Bank 1", quantity: 4, location: "Aisle 12" },
      { partNumber: "17801-0Y060", name: "Air filter", quantity: 12, location: "Aisle 5" },
    ],
    alternatives: [
      { partNumber: "OX-234", name: "O2 Sensor (aftermarket)", oemPartNumber: "89465-0D210", aftermarket: true },
    ],
  },
  workflow: {
    stages: [
      { id: "diagnose", name: "Diagnose", status: "done", estimatedMin: 15, actualMin: 12, startedAt: new Date(), completedAt: new Date() },
      { id: "parts", name: "Parts", status: "done", estimatedMin: 10, actualMin: 8, startedAt: new Date(), completedAt: new Date() },
      { id: "repair", name: "Repair", status: "active", estimatedMin: 45, actualMin: null, startedAt: new Date(), completedAt: null },
      { id: "test", name: "Test", status: "pending", estimatedMin: 20, actualMin: null, startedAt: null, completedAt: null },
      { id: "complete", name: "Complete", status: "pending", estimatedMin: 5, actualMin: null, startedAt: null, completedAt: null },
    ],
  },
  timeEstimate: {
    estimatedMinutes: 80,
    actualMinutes: 20,
    eta: new Date(Date.now() + 60 * 60 * 1000),
    startedAt: new Date(),
  },
  arSteps: [
    { order: 1, title: "Locate O2 sensor", instruction: "Point camera at exhaust manifold. Sensor is before catalytic converter.", highlightComponent: "O2_Bank1" },
    { order: 2, title: "Disconnect", instruction: "Unplug electrical connector. Remove sensor with 22mm wrench.", highlightComponent: "O2_connector" },
    { order: 3, title: "Install", instruction: "Apply anti-seize to threads. Torque to 35 Nm.", highlightComponent: "O2_Bank1" },
  ],
});

const defaultTechnicianStats = {
  technicianId: "tech-001",
  performance: {
    firstTimeFixRate: 94,
    reworkPercent: 3,
    customerRating: 4.8,
    workshopAverage: 4.2,
    trends: [
      { period: "Jan 2025", score: 92, label: "First-time fix" },
      { period: "Feb 2025", score: 93, label: "First-time fix" },
      { period: "Mar 2025", score: 94, label: "First-time fix" },
    ],
    goals: [
      { name: "First-time fix rate", target: 95, current: 94, unit: "%" },
      { name: "Rework", target: 2, current: 3, unit: "%" },
      { name: "Customer rating", target: 4.8, current: 4.8, unit: "/5" },
    ],
  },
  earnings: {
    byPeriod: [
      { period: "today", label: "Today", base: 120, incentive: 20, total: 140 },
      { period: "week", label: "This week", base: 680, incentive: 95, total: 775 },
      { period: "month", label: "This month", base: 2840, incentive: 420, total: 3260 },
    ],
    byJobType: [
      { jobType: "Oil Change", labourUnits: 0.5, amount: 42, count: 12 },
      { jobType: "Brake Service", labourUnits: 2, amount: 280, count: 3 },
      { jobType: "Diagnostics", labourUnits: 1, amount: 95, count: 5 },
    ],
    payouts: [
      { date: "2025-03-01", amount: 3180, status: "paid", method: "Direct deposit" },
      { date: "2025-02-28", amount: 3020, status: "paid", method: "Direct deposit" },
    ],
    nextPayDate: "2025-03-31",
    pendingAmount: 775,
  },
};

async function ensureTechnicianSeed() {
  if (!isDbConnected()) return;
  const profileCount = await TechnicianProfile.countDocuments();
  if (profileCount === 0) {
    await TechnicianProfile.create(defaultTechnicianProfile);
    console.log("Technician: seeded TechnicianProfile.");
  }
  const statsCount = await TechnicianStats.countDocuments();
  if (statsCount === 0) {
    await TechnicianStats.create(defaultTechnicianStats);
    console.log("Technician: seeded TechnicianStats.");
  }
  const extraCount = await TechnicianJobExtra.countDocuments();
  if (extraCount === 0) {
    await ensureFleetExtendedSeed();
    const jobs = await FleetMaintenance.find().lean();
    const jobIds = jobs.map((j, i) => (j._id || `job-${i}`).toString());
    for (let i = 0; i < jobIds.length; i++) {
      const j = jobs[i];
      const jobType = j.type || "Oil Change";
      const plate = j.vehiclePlate || "AB-1234";
      const extra = defaultTechnicianJobExtras(jobIds[i], plate, jobType);
      if (i === 1) {
        extra.faultDetection = {
          faults: [
            { fault: "Cylinder 2 misfire", cause: "Ignition coil or plug", confidence: 0.91, evidence: "P0302" },
          ],
          rootCause: { primary: "Ignition coil #2", contributing: [] },
          similarCases: [{ caseId: "C-2024-098", vehiclePlate: "CD-0000", summary: "P0302 Sprinter", outcome: "Replaced coil" }],
        };
        extra.repairRecommendations.steps = [
          { order: 1, name: "Test coil", description: "Swap coil 2 with 3, recheck", durationMin: 10 },
          { order: 2, name: "Replace coil", description: "Replace faulty ignition coil", durationMin: 25 },
        ];
        extra.repairRecommendations.labourMinutes = 35;
        extra.timeEstimate.estimatedMinutes = 35;
      }
      if (i === 2) {
        extra.faultDetection = {
          faults: [
            { fault: "Front brake pad wear below 3mm", cause: "Normal wear", confidence: 0.95, evidence: "Visual inspection" },
            { fault: "Rotor thickness at minimum", cause: "Aged rotors", confidence: 0.88, evidence: "Micrometer reading" },
          ],
          rootCause: { primary: "Worn brake pads and rotors (front)", contributing: ["High mileage", "City driving"] },
          similarCases: [
            { caseId: "C-2024-201", vehiclePlate: "GH-5555", summary: "Hiace front brakes", outcome: "Pads and rotors replaced" },
          ],
        };
        extra.repairRecommendations.steps = [
          { order: 1, name: "Lift and remove wheels", description: "Secure vehicle, remove front wheels", durationMin: 10 },
          { order: 2, name: "Replace pads and rotors", description: "Install new pads and resurface or replace rotors", durationMin: 45 },
          { order: 3, name: "Bleed and test", description: "Bleed brakes, bed pads, test drive", durationMin: 25 },
        ];
        extra.repairRecommendations.parts = [
          { partNumber: "PAD-TH-2024", name: "Brake pads (front)", quantity: 1, inStock: true, unitPrice: 68 },
          { partNumber: "ROT-TH-F", name: "Brake rotor (front)", quantity: 2, inStock: true, unitPrice: 95 },
        ];
        extra.repairRecommendations.labourMinutes = 80;
        extra.partsPrediction.predicted = extra.repairRecommendations.parts;
        extra.timeEstimate.estimatedMinutes = 80;
        extra.arSteps = [
          { order: 1, title: "Lift vehicle", instruction: "Position lift pads under jack points. Raise vehicle safely.", highlightComponent: "Lift" },
          { order: 2, title: "Remove caliper", instruction: "Remove caliper bolts. Hang caliper. Remove old pads.", highlightComponent: "Caliper" },
          { order: 3, title: "Replace rotor", instruction: "Remove rotor. Install new rotor. Torque to spec.", highlightComponent: "Rotor" },
          { order: 4, title: "Install pads", instruction: "Compress piston. Install new pads and hardware.", highlightComponent: "Pads" },
        ];
      }
      await TechnicianJobExtra.create(extra);
    }
    console.log("Technician: seeded TechnicianJobExtra for", jobIds.length, "jobs.");
  }
}

app.get("/api/technician/profile", async (req, res) => {
  try {
    if (!isDbConnected()) return res.json(defaultTechnicianProfile);
    await ensureTechnicianSeed();
    const doc = await TechnicianProfile.findOne({ technicianId: "tech-001" }).lean();
    return res.json(doc || defaultTechnicianProfile);
  } catch (err) {
    console.error("Technician profile error:", err);
    return res.json(defaultTechnicianProfile);
  }
});

app.get("/api/technician/ai-faults", async (req, res) => {
  const { jobId } = req.query;
  const ctx = getDefaultJobContext(jobId || "job-1");
  const fallback = defaultTechnicianJobExtras(jobId || "job-1", ctx.vehiclePlate, ctx.jobType);
  try {
    if (!isDbConnected()) return res.json(fallback.faultDetection);
    await ensureTechnicianSeed();
    let doc = null;
    if (jobId) doc = await TechnicianJobExtra.findOne({ jobId }).lean();
    else doc = await TechnicianJobExtra.findOne().lean();
    const data = doc?.faultDetection || fallback.faultDetection;
    return res.json(data);
  } catch (err) {
    console.error("Technician ai-faults error:", err);
    return res.json(fallback.faultDetection);
  }
});

app.get("/api/technician/repair-recommendations", async (req, res) => {
  const { jobId } = req.query;
  const ctx = getDefaultJobContext(jobId || "job-1");
  const fallback = defaultTechnicianJobExtras(jobId || "job-1", ctx.vehiclePlate, ctx.jobType);
  try {
    if (!isDbConnected()) return res.json(fallback.repairRecommendations);
    await ensureTechnicianSeed();
    let doc = null;
    if (jobId) doc = await TechnicianJobExtra.findOne({ jobId }).lean();
    else doc = await TechnicianJobExtra.findOne().lean();
    return res.json(doc?.repairRecommendations || fallback.repairRecommendations);
  } catch (err) {
    console.error("Technician repair-recommendations error:", err);
    return res.json(fallback.repairRecommendations);
  }
});

app.get("/api/technician/parts-prediction", async (req, res) => {
  const { jobId } = req.query;
  const ctx = getDefaultJobContext(jobId || "job-1");
  const fallback = defaultTechnicianJobExtras(jobId || "job-1", ctx.vehiclePlate, ctx.jobType);
  try {
    if (!isDbConnected()) return res.json(fallback.partsPrediction);
    await ensureTechnicianSeed();
    let doc = null;
    if (jobId) doc = await TechnicianJobExtra.findOne({ jobId }).lean();
    else doc = await TechnicianJobExtra.findOne().lean();
    return res.json(doc?.partsPrediction || fallback.partsPrediction);
  } catch (err) {
    console.error("Technician parts-prediction error:", err);
    return res.json(fallback.partsPrediction);
  }
});

app.get("/api/technician/workflow", async (req, res) => {
  const { jobId } = req.query;
  const ctx = getDefaultJobContext(jobId || "job-1");
  const fallback = defaultTechnicianJobExtras(jobId || "job-1", ctx.vehiclePlate, ctx.jobType);
  try {
    if (!isDbConnected()) return res.json(fallback.workflow);
    await ensureTechnicianSeed();
    let doc = null;
    if (jobId) doc = await TechnicianJobExtra.findOne({ jobId }).lean();
    else doc = await TechnicianJobExtra.findOne().lean();
    return res.json(doc?.workflow || fallback.workflow);
  } catch (err) {
    console.error("Technician workflow error:", err);
    return res.json(fallback.workflow);
  }
});

function serializeTimeEstimate(te) {
  if (!te) return te;
  const out = { ...te };
  if (out.eta && out.eta instanceof Date) out.eta = out.eta.toISOString();
  if (out.startedAt && out.startedAt instanceof Date) out.startedAt = out.startedAt.toISOString();
  return out;
}

app.get("/api/technician/time-estimate", async (req, res) => {
  const { jobId } = req.query;
  const ctx = getDefaultJobContext(jobId || "job-1");
  const fallback = defaultTechnicianJobExtras(jobId || "job-1", ctx.vehiclePlate, ctx.jobType);
  try {
    if (!isDbConnected()) return res.json(serializeTimeEstimate(fallback.timeEstimate));
    await ensureTechnicianSeed();
    let doc = null;
    if (jobId) doc = await TechnicianJobExtra.findOne({ jobId }).lean();
    else doc = await TechnicianJobExtra.findOne().lean();
    const te = doc?.timeEstimate || fallback.timeEstimate;
    return res.json(serializeTimeEstimate(te));
  } catch (err) {
    console.error("Technician time-estimate error:", err);
    return res.json(serializeTimeEstimate(fallback.timeEstimate));
  }
});

app.post("/api/technician/time-estimate", async (req, res) => {
  const { jobId, action, actualMinutes } = req.body || {};
  const ctx = getDefaultJobContext(jobId || "job-1");
  const fallback = defaultTechnicianJobExtras(jobId || "job-1", ctx.vehiclePlate, ctx.jobType);
  try {
    if (!isDbConnected()) {
      const te = { ...fallback.timeEstimate };
      if (action === "start") {
        te.startedAt = new Date().toISOString();
        te.eta = new Date(Date.now() + (te.estimatedMinutes || 60) * 60 * 1000).toISOString();
      }
      if (action === "update" && typeof actualMinutes === "number") te.actualMinutes = actualMinutes;
      if (action === "complete" && typeof actualMinutes === "number") te.actualMinutes = actualMinutes;
      return res.json(serializeTimeEstimate(te));
    }
    await ensureTechnicianSeed();
    let doc = await TechnicianJobExtra.findOne(jobId ? { jobId } : {});
    if (!doc) {
      const extra = defaultTechnicianJobExtras(jobId || "job-1", ctx.vehiclePlate, ctx.jobType);
      doc = await TechnicianJobExtra.create(extra);
    }
    const te = doc.timeEstimate || {};
    if (action === "start") {
      doc.timeEstimate = doc.timeEstimate || {};
      doc.timeEstimate.startedAt = new Date();
      doc.timeEstimate.eta = new Date(Date.now() + (te.estimatedMinutes || doc.timeEstimate.estimatedMinutes || 60) * 60 * 1000);
      await doc.save();
    }
    if (action === "update" && typeof actualMinutes === "number") {
      doc.timeEstimate = doc.timeEstimate || {};
      doc.timeEstimate.actualMinutes = actualMinutes;
      await doc.save();
    }
    if (action === "complete" && typeof actualMinutes === "number") {
      doc.timeEstimate = doc.timeEstimate || {};
      doc.timeEstimate.actualMinutes = actualMinutes;
      doc.timeEstimate.eta = new Date();
      await doc.save();
    }
    const updated = await TechnicianJobExtra.findById(doc._id).lean();
    const result = updated?.timeEstimate || doc.timeEstimate || fallback.timeEstimate;
    return res.json(serializeTimeEstimate(result));
  } catch (err) {
    console.error("Technician time-estimate POST error:", err);
    const te = { ...fallback.timeEstimate };
    if (action === "start") {
      te.startedAt = new Date().toISOString();
      te.eta = new Date(Date.now() + (te.estimatedMinutes || 60) * 60 * 1000).toISOString();
    }
    if ((action === "update" || action === "complete") && typeof actualMinutes === "number") te.actualMinutes = actualMinutes;
    return res.json(serializeTimeEstimate(te));
  }
});

app.get("/api/technician/ar-steps", async (req, res) => {
  const { jobId } = req.query;
  const ctx = getDefaultJobContext(jobId || "job-1");
  const fallback = defaultTechnicianJobExtras(jobId || "job-1", ctx.vehiclePlate, ctx.jobType);
  try {
    if (!isDbConnected()) return res.json({ steps: fallback.arSteps });
    await ensureTechnicianSeed();
    let doc = null;
    if (jobId) doc = await TechnicianJobExtra.findOne({ jobId }).lean();
    else doc = await TechnicianJobExtra.findOne().lean();
    return res.json({ steps: doc?.arSteps || fallback.arSteps });
  } catch (err) {
    console.error("Technician ar-steps error:", err);
    return res.json({ steps: fallback.arSteps });
  }
});

app.get("/api/technician/performance", async (req, res) => {
  try {
    if (!isDbConnected()) return res.json(defaultTechnicianStats.performance);
    await ensureTechnicianSeed();
    const doc = await TechnicianStats.findOne({ technicianId: "tech-001" }).lean();
    return res.json(doc?.performance || defaultTechnicianStats.performance);
  } catch (err) {
    console.error("Technician performance error:", err);
    return res.json(defaultTechnicianStats.performance);
  }
});

app.get("/api/technician/earnings", async (req, res) => {
  try {
    if (!isDbConnected()) return res.json(defaultTechnicianStats.earnings);
    await ensureTechnicianSeed();
    const doc = await TechnicianStats.findOne({ technicianId: "tech-001" }).lean();
    return res.json(doc?.earnings || defaultTechnicianStats.earnings);
  } catch (err) {
    console.error("Technician earnings error:", err);
    return res.json(defaultTechnicianStats.earnings);
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

// ---------- Property: parking, slots, pricing, EV, load, revenue, peak, access, carbon ----------
const defaultPropertyParkingStats = {
  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  utilization: [78, 82, 75, 88, 85, 90],
  revenue: [4200, 4850, 5100, 4900, 5300, 5600],
  currency: "USD",
  totalSlots: 120,
  zones: [{ id: "A", name: "Lot A", slots: 40, occupied: 32 }, { id: "B", name: "Lot B", slots: 50, occupied: 38 }, { id: "C", name: "EV only", slots: 30, occupied: 22 }],
};

app.get("/api/property/parking-stats", async (req, res) => {
  try {
    return res.json(defaultPropertyParkingStats);
  } catch (err) {
    return res.status(200).json(defaultPropertyParkingStats);
  }
});

const defaultPropertySlots = [
  { id: "P-001", type: "parking", zoneId: "A", status: "available", reservedUntil: null },
  { id: "P-002", type: "parking", zoneId: "A", status: "occupied", reservedUntil: null },
  { id: "P-003", type: "parking", zoneId: "A", status: "reserved", reservedUntil: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() },
  { id: "EV-001", type: "ev", zoneId: "C", status: "available", reservedUntil: null, powerKw: 22 },
  { id: "EV-002", type: "ev", zoneId: "C", status: "in_use", reservedUntil: null, powerKw: 50 },
  { id: "EV-003", type: "ev", zoneId: "C", status: "available", reservedUntil: null, powerKw: 22 },
];

app.get("/api/property/slots", (req, res) => {
  res.json({ slots: defaultPropertySlots, total: defaultPropertySlots.length });
});

const defaultPropertyDynamicPricing = {
  parkingRates: [
    { zoneId: "A", basePerHour: 3, peakMultiplier: 1.5, peakHours: "17:00-20:00" },
    { zoneId: "B", basePerHour: 2.5, peakMultiplier: 1.3, peakHours: "08:00-10:00,17:00-19:00" },
  ],
  evRates: [{ ratePerKwh: 0.32, offPeakPerKwh: 0.22, offPeakHours: "22:00-06:00" }],
  overrides: [{ id: "ov-1", zoneId: "A", reason: "Event", multiplier: 1.8, validFrom: "2025-03-20T00:00:00", validTo: "2025-03-21T23:59:59" }],
};

app.get("/api/property/dynamic-pricing", (req, res) => {
  res.json(defaultPropertyDynamicPricing);
});

const defaultPropertyEvCharging = {
  stations: [
    { id: "ST-1", name: "Bay 1", connectors: 2, available: 1, inUse: 1, powerKw: 22, status: "online" },
    { id: "ST-2", name: "Bay 2", connectors: 2, available: 2, inUse: 0, powerKw: 50, status: "online" },
    { id: "ST-3", name: "Bay 3", connectors: 1, available: 0, inUse: 1, powerKw: 22, status: "online" },
  ],
  totalSessionsToday: 24,
  totalKwhToday: 312,
};

app.get("/api/property/ev-charging", (req, res) => {
  res.json(defaultPropertyEvCharging);
});

const defaultPropertyLoadBalancing = {
  totalDrawKw: 72,
  capacityKw: 150,
  utilizationPercent: 48,
  byStation: [
    { stationId: "ST-1", drawKw: 22, capacityKw: 44, status: "ok" },
    { stationId: "ST-2", drawKw: 0, capacityKw: 100, status: "ok" },
    { stationId: "ST-3", drawKw: 22, capacityKw: 22, status: "ok" },
  ],
  alerts: [],
};

app.get("/api/property/load-balancing", (req, res) => {
  res.json(defaultPropertyLoadBalancing);
});

const defaultPropertyRevenueAnalytics = {
  bySource: [
    { source: "Parking", amount: 12400, percent: 72, period: "month" },
    { source: "EV charging", amount: 4800, percent: 28, period: "month" },
  ],
  byPeriod: [
    { period: "Today", parking: 420, ev: 180 },
    { period: "This week", parking: 2850, ev: 920 },
    { period: "This month", parking: 12400, ev: 4800 },
  ],
  currency: "USD",
};

app.get("/api/property/revenue-analytics", (req, res) => {
  res.json(defaultPropertyRevenueAnalytics);
});

const defaultPropertyPeakTraffic = {
  forecast: [
    { hour: "08:00", occupancyPercent: 72, chargingDemandKw: 44 },
    { hour: "12:00", occupancyPercent: 45, chargingDemandKw: 22 },
    { hour: "17:00", occupancyPercent: 88, chargingDemandKw: 66 },
    { hour: "19:00", occupancyPercent: 85, chargingDemandKw: 50 },
  ],
  peakWindows: [
    { start: "07:30", end: "09:30", label: "Morning commute", suggestedMultiplier: 1.4 },
    { start: "16:30", end: "19:30", label: "Evening peak", suggestedMultiplier: 1.5 },
  ],
};

app.get("/api/property/peak-traffic", (req, res) => {
  res.json(defaultPropertyPeakTraffic);
});

const defaultPropertyAccessControl = {
  rules: [
    { id: "r1", name: "Monthly pass", type: "subscription", access: ["A", "B"], active: true },
    { id: "r2", name: "EV only", type: "vehicle", access: ["C"], active: true },
  ],
  allowlist: [{ id: "a1", label: "VIP vehicles", count: 12 }],
  blocklist: [{ id: "b1", label: "Overstay", count: 3 }],
  recentLog: [
    { at: new Date().toISOString(), action: "entry", gateId: "G1", vehicleId: "***456" },
    { at: new Date(Date.now() - 300000).toISOString(), action: "exit", gateId: "G2", vehicleId: "***789" },
  ],
};

app.get("/api/property/access-control", (req, res) => {
  res.json(defaultPropertyAccessControl);
});

const defaultPropertyCarbonImpact = {
  kwhDeliveredToday: 312,
  kwhDeliveredMonth: 8420,
  co2AvoidedKgMonth: 4200,
  equivalentIceKm: 16800,
  trend: [{ month: "Jan", kwh: 7200, co2Kg: 3600 }, { month: "Feb", kwh: 7800, co2Kg: 3900 }, { month: "Mar", kwh: 8420, co2Kg: 4200 }],
};

app.get("/api/property/carbon-impact", (req, res) => {
  res.json(defaultPropertyCarbonImpact);
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
      return res.json(dealerInventoryMemory);
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

const dealerInventoryMemory = defaultFleetVehicles.map((v, i) => ({
  id: `memory-${i}`,
  make: (v.model || "").split(" ")[0] || "Vehicle",
  model: (v.model || "").replace(/^\w+\s/, "") || v.model || "—",
  year: 2024,
  price: 40000 + (i + 1) * 5000,
  status: v.status === "maintenance" ? "service" : "available",
  plateNumber: v.plateNumber,
  notes: "",
}));

app.post("/api/dealer/inventory", async (req, res) => {
  try {
    const { id, make, model, year, price, status, plateNumber, notes } = req.body || {};
    if (!plateNumber || !make || !model) {
      return res.status(400).json({ error: "plateNumber, make and model are required" });
    }
    const payload = {
      make: String(make).trim(),
      model: String(model).trim(),
      year: Number(year) || new Date().getFullYear(),
      price: Number(price) || 0,
      status: status || "available",
      plateNumber: String(plateNumber).trim(),
      notes: String(notes || "").trim(),
    };

    if (isDbConnected()) {
      await ensureFleetSeed();
      const doc = id ? await FleetVehicle.findByIdAndUpdate(id, { plateNumber: payload.plateNumber, model: `${payload.make} ${payload.model}`, status: payload.status }, { new: true, upsert: false }) : null;
      if (doc) {
        return res.json({
          dataSource: "live",
          success: true,
          vehicle: { id: doc._id.toString(), ...payload },
          lastUpdated: new Date().toISOString(),
        });
      }
      const created = await FleetVehicle.create({
        plateNumber: payload.plateNumber,
        model: `${payload.make} ${payload.model}`,
        status: payload.status,
      });
      return res.json({
        dataSource: "live",
        success: true,
        vehicle: { id: created._id.toString(), ...payload },
        lastUpdated: new Date().toISOString(),
      });
    }

    const existingIndex = id ? dealerInventoryMemory.findIndex((v) => v.id === id) : -1;
    const vehicle = {
      id: existingIndex >= 0 ? dealerInventoryMemory[existingIndex].id : `memory-${Date.now()}`,
      ...payload,
    };
    if (existingIndex >= 0) dealerInventoryMemory[existingIndex] = vehicle;
    else dealerInventoryMemory.unshift(vehicle);
    return res.json({ dataSource: "fallback", success: true, vehicle, lastUpdated: new Date().toISOString() });
  } catch (err) {
    console.error("Dealer inventory save error:", err);
    return res.status(200).json({
      dataSource: "fallback",
      success: false,
      vehicle: null,
      lastUpdated: new Date().toISOString(),
    });
  }
});

// ---------- Dealer: Leads ----------
const fallbackLeads = [
  { id: "L1", name: "John Smith", email: "john@example.com", phone: "+1 555-0101", source: "Website", status: "new", score: 72, createdAt: "2025-03-15T10:00:00Z" },
  { id: "L2", name: "Jane Doe", email: "jane@example.com", phone: "+1 555-0102", source: "Referral", status: "contacted", score: 85, createdAt: "2025-03-14T14:00:00Z" },
  { id: "L3", name: "Bob Wilson", email: "bob@example.com", phone: "+1 555-0103", source: "Walk-in", status: "qualified", score: 90, createdAt: "2025-03-13T09:00:00Z" },
];
app.get("/api/dealer/leads", async (req, res) => {
  try {
    const dataSource = isDbConnected() ? "live" : "fallback";
    const leads = dataSource === "live" ? fallbackLeads : fallbackLeads;
    return res.json({ dataSource, leads, lastUpdated: new Date().toISOString() });
  } catch (err) {
    console.error("Dealer leads error:", err);
    return res.status(200).json({ dataSource: "fallback", leads: fallbackLeads, lastUpdated: new Date().toISOString() });
  }
});

// ---------- Dealer: Dynamic pricing ----------
const fallbackPricing = {
  suggestedPrices: [
    { vehicleId: "V1", make: "Toyota", model: "Camry", currentPrice: 28500, suggestedPrice: 27900, margin: 0.12, reason: "Market dip" },
    { vehicleId: "V2", make: "Honda", model: "Accord", currentPrice: 31000, suggestedPrice: 30500, margin: 0.11, reason: "Competitor promo" },
  ],
  rules: [{ id: "r1", name: "Floor discount", value: "5% max" }, { id: "r2", name: "Clearance", value: "10% on 90+ days" }],
};
app.get("/api/dealer/dynamic-pricing", async (req, res) => {
  try {
    const dataSource = isDbConnected() ? "live" : "fallback";
    return res.json({ dataSource, ...fallbackPricing, lastUpdated: new Date().toISOString() });
  } catch (err) {
    console.error("Dealer dynamic-pricing error:", err);
    return res.status(200).json({ dataSource: "fallback", ...fallbackPricing, lastUpdated: new Date().toISOString() });
  }
});

// ---------- Dealer: Demand forecast ----------
const fallbackDemand = {
  bySegment: [
    { segment: "Sedan", demand: 45, stock: 38, gap: 7 },
    { segment: "SUV", demand: 62, stock: 55, gap: 7 },
    { segment: "Compact", demand: 28, stock: 30, gap: -2 },
  ],
  byMonth: [
    { month: "2025-04", demand: 120, trend: "up" },
    { month: "2025-05", demand: 135, trend: "up" },
    { month: "2025-06", demand: 128, trend: "stable" },
  ],
};
app.get("/api/dealer/demand-forecast", async (req, res) => {
  try {
    const dataSource = isDbConnected() ? "live" : "fallback";
    return res.json({ dataSource, ...fallbackDemand, lastUpdated: new Date().toISOString() });
  } catch (err) {
    console.error("Dealer demand-forecast error:", err);
    return res.status(200).json({ dataSource: "fallback", ...fallbackDemand, lastUpdated: new Date().toISOString() });
  }
});

// ---------- Dealer: Sales funnel ----------
const fallbackFunnel = {
  stages: [
    { stage: "Lead", count: 124, conversion: 100 },
    { stage: "Contacted", count: 89, conversion: 72 },
    { stage: "Qualified", count: 45, conversion: 36 },
    { stage: "Proposal", count: 28, conversion: 23 },
    { stage: "Closed", count: 18, conversion: 15 },
  ],
  summary: { totalLeads: 124, winRate: 0.145 },
};
app.get("/api/dealer/sales-funnel", async (req, res) => {
  try {
    const dataSource = isDbConnected() ? "live" : "fallback";
    return res.json({ dataSource, ...fallbackFunnel, lastUpdated: new Date().toISOString() });
  } catch (err) {
    console.error("Dealer sales-funnel error:", err);
    return res.status(200).json({ dataSource: "fallback", ...fallbackFunnel, lastUpdated: new Date().toISOString() });
  }
});

// ---------- Dealer: Sales analytics ----------
const fallbackSales = {
  totalRevenue: 485000,
  unitsSold: 42,
  avgDealSize: 11548,
  byMonth: [
    { month: "Jan 2025", revenue: 142000, units: 12 },
    { month: "Feb 2025", revenue: 168000, units: 15 },
    { month: "Mar 2025", revenue: 175000, units: 15 },
  ],
};
app.get("/api/dealer/sales-analytics", async (req, res) => {
  try {
    const dataSource = isDbConnected() ? "live" : "fallback";
    return res.json({ dataSource, ...fallbackSales, lastUpdated: new Date().toISOString() });
  } catch (err) {
    console.error("Dealer sales-analytics error:", err);
    return res.status(200).json({ dataSource: "fallback", ...fallbackSales, lastUpdated: new Date().toISOString() });
  }
});

// ---------- Dealer: Commission ----------
const fallbackCommission = {
  totalEarned: 24500,
  pending: 3200,
  byStaff: [
    { staffId: "S1", name: "Alex Sales", earned: 8200, pending: 1100, deals: 12 },
    { staffId: "S2", name: "Sam Jones", earned: 7800, pending: 900, deals: 10 },
    { staffId: "S3", name: "Jordan Lee", earned: 8500, pending: 1200, deals: 14 },
  ],
};
app.get("/api/dealer/commission", async (req, res) => {
  try {
    const dataSource = isDbConnected() ? "live" : "fallback";
    return res.json({ dataSource, ...fallbackCommission, lastUpdated: new Date().toISOString() });
  } catch (err) {
    console.error("Dealer commission error:", err);
    return res.status(200).json({ dataSource: "fallback", ...fallbackCommission, lastUpdated: new Date().toISOString() });
  }
});

// ---------- Dealer: Market trends ----------
const fallbackMarketTrends = {
  insights: [
    { id: "1", title: "SUV demand up 12%", segment: "SUV", trend: "up", impact: "Consider stocking more SUVs" },
    { id: "2", title: "Sedan prices softening", segment: "Sedan", trend: "down", impact: "Review sedan margins" },
    { id: "3", title: "EV interest rising", segment: "EV", trend: "up", impact: "Promote EV inventory" },
  ],
  priceIndex: { sedan: 98, suv: 104, truck: 102 },
};
app.get("/api/dealer/market-trends", async (req, res) => {
  try {
    const dataSource = isDbConnected() ? "live" : "fallback";
    return res.json({ dataSource, ...fallbackMarketTrends, lastUpdated: new Date().toISOString() });
  } catch (err) {
    console.error("Dealer market-trends error:", err);
    return res.status(200).json({ dataSource: "fallback", ...fallbackMarketTrends, lastUpdated: new Date().toISOString() });
  }
});

// ---------- Dealer: Trade-in valuation (sample) ----------
const fallbackValuations = [
  { id: "T1", make: "Toyota", model: "Camry", year: 2020, mileage: 45000, condition: "Good", rangeLow: 16500, rangeHigh: 18200, certifiedOffer: 17500 },
  { id: "T2", make: "Honda", model: "Civic", year: 2019, mileage: 52000, condition: "Fair", rangeLow: 14200, rangeHigh: 15800, certifiedOffer: 15000 },
];
app.get("/api/dealer/trade-in-valuations", async (req, res) => {
  try {
    const dataSource = isDbConnected() ? "live" : "fallback";
    return res.json({ dataSource, valuations: fallbackValuations, lastUpdated: new Date().toISOString() });
  } catch (err) {
    console.error("Dealer trade-in error:", err);
    return res.status(200).json({ dataSource: "fallback", valuations: fallbackValuations, lastUpdated: new Date().toISOString() });
  }
});

// ---------- Dealer: Customer profiles (sample) ----------
const fallbackCustomers = [
  { id: "C1", name: "John Smith", email: "john@example.com", vehiclesOwned: 1, lastVisit: "2025-03-10", lifetimeValue: 28500 },
  { id: "C2", name: "Jane Doe", email: "jane@example.com", vehiclesOwned: 2, lastVisit: "2025-03-14", lifetimeValue: 52000 },
  { id: "C3", name: "Bob Wilson", email: "bob@example.com", vehiclesOwned: 1, lastVisit: "2025-02-28", lifetimeValue: 31000 },
];
app.get("/api/dealer/customers", async (req, res) => {
  try {
    const dataSource = isDbConnected() ? "live" : "fallback";
    return res.json({ dataSource, customers: fallbackCustomers, lastUpdated: new Date().toISOString() });
  } catch (err) {
    console.error("Dealer customers error:", err);
    return res.status(200).json({ dataSource: "fallback", customers: fallbackCustomers, lastUpdated: new Date().toISOString() });
  }
});

// ---------- Dealer: Finance integration ----------
const fallbackFinance = {
  lenders: [
    { id: "L1", name: "Dealer Finance Co", status: "active", approvalRate: 0.78 },
    { id: "L2", name: "Prime Auto Loans", status: "active", approvalRate: 0.82 },
  ],
  summary: { applicationsThisMonth: 28, approved: 22, avgApr: 6.5 },
};
app.get("/api/dealer/finance-integration", async (req, res) => {
  try {
    const dataSource = isDbConnected() ? "live" : "fallback";
    return res.json({ dataSource, ...fallbackFinance, lastUpdated: new Date().toISOString() });
  } catch (err) {
    console.error("Dealer finance error:", err);
    return res.status(200).json({ dataSource: "fallback", ...fallbackFinance, lastUpdated: new Date().toISOString() });
  }
});

// ---------- Sales: Dashboard overview ----------
const fallbackSalesDashboard = {
  myLeads: 12,
  hotProspects: 3,
  followUpsDue: 5,
  pipelineValue: 185000,
  dealsInProgress: 8,
  monthlyTarget: 250000,
  monthlyAchieved: 142000,
  targetPercent: 56.8,
  commissionEarned: 4200,
  commissionPending: 1800,
};
app.get("/api/sales/dashboard", async (req, res) => {
  try {
    const dataSource = isDbConnected() ? "live" : "fallback";
    return res.json({ dataSource, ...fallbackSalesDashboard, lastUpdated: new Date().toISOString() });
  } catch (err) {
    console.error("Sales dashboard error:", err);
    return res.status(200).json({ dataSource: "fallback", ...fallbackSalesDashboard, lastUpdated: new Date().toISOString() });
  }
});

// ---------- Sales: Lead assignment & scoring ----------
const fallbackLeadAssignment = {
  leadQueue: [
    { id: "L1", name: "Alex Chen", email: "alex@example.com", source: "Website", score: 85, status: "unassigned", createdAt: "2025-03-16T09:00:00Z" },
    { id: "L2", name: "Sam Davis", email: "sam@example.com", source: "Walk-in", score: 92, status: "assigned", assignedTo: "Rep 1", createdAt: "2025-03-15T14:00:00Z" },
    { id: "L3", name: "Jordan Lee", email: "jordan@example.com", source: "Referral", score: 78, status: "unassigned", createdAt: "2025-03-15T11:00:00Z" },
  ],
  scoringRules: [
    { id: "r1", name: "Budget match", weight: 0.3 },
    { id: "r2", name: "Intent score", weight: 0.4 },
    { id: "r3", name: "Vehicle interest", weight: 0.3 },
  ],
  assignmentMode: "auto",
};
app.get("/api/sales/lead-assignment", async (req, res) => {
  try {
    const dataSource = isDbConnected() ? "live" : "fallback";
    return res.json({ dataSource, ...fallbackLeadAssignment, lastUpdated: new Date().toISOString() });
  } catch (err) {
    console.error("Sales lead-assignment error:", err);
    return res.status(200).json({ dataSource: "fallback", ...fallbackLeadAssignment, lastUpdated: new Date().toISOString() });
  }
});

// ---------- Sales: Customer interaction logs ----------
const fallbackInteractions = {
  activities: [
    { id: "A1", leadId: "L1", type: "call", summary: "Initial discovery call", at: "2025-03-16T10:30:00Z", rep: "You" },
    { id: "A2", leadId: "L2", type: "test_drive", summary: "Test drive Camry", at: "2025-03-15T15:00:00Z", rep: "You" },
    { id: "A3", leadId: "L3", type: "email", summary: "Quote sent", at: "2025-03-14T09:00:00Z", rep: "You" },
  ],
  notesByLead: { L1: "Interested in sedan, budget 30k", L2: "Prefer SUV, follow up Friday" },
};
app.get("/api/sales/customer-interactions", async (req, res) => {
  try {
    const dataSource = isDbConnected() ? "live" : "fallback";
    return res.json({ dataSource, ...fallbackInteractions, lastUpdated: new Date().toISOString() });
  } catch (err) {
    console.error("Sales customer-interactions error:", err);
    return res.status(200).json({ dataSource: "fallback", ...fallbackInteractions, lastUpdated: new Date().toISOString() });
  }
});

// ---------- Sales: Performance metrics ----------
const fallbackPerformance = {
  conversionRates: { leadToQualified: 0.42, qualifiedToProposal: 0.65, proposalToWon: 0.38 },
  activity: { callsThisWeek: 45, meetings: 12, testDrives: 8, proposalsSent: 6 },
  rankings: [
    { rank: 1, name: "You", volume: 14, revenue: 198000, targetPercent: 79 },
    { rank: 2, name: "Rep 2", volume: 12, revenue: 168000, targetPercent: 67 },
    { rank: 3, name: "Rep 3", volume: 10, revenue: 142000, targetPercent: 57 },
  ],
};
app.get("/api/sales/performance-metrics", async (req, res) => {
  try {
    const dataSource = isDbConnected() ? "live" : "fallback";
    return res.json({ dataSource, ...fallbackPerformance, lastUpdated: new Date().toISOString() });
  } catch (err) {
    console.error("Sales performance-metrics error:", err);
    return res.status(200).json({ dataSource: "fallback", ...fallbackPerformance, lastUpdated: new Date().toISOString() });
  }
});

// ---------- Sales: Commission tracker ----------
const fallbackSalesCommission = {
  earned: 4200,
  pending: 1800,
  payoutHistory: [
    { id: "P1", period: "Feb 2025", amount: 3850, paidAt: "2025-03-05" },
    { id: "P2", period: "Jan 2025", amount: 4100, paidAt: "2025-02-05" },
  ],
  byDeal: [
    { dealId: "D1", vehicle: "Toyota Camry", amount: 850, status: "paid" },
    { dealId: "D2", vehicle: "Honda Accord", amount: 720, status: "pending" },
  ],
};
app.get("/api/sales/commission", async (req, res) => {
  try {
    const dataSource = isDbConnected() ? "live" : "fallback";
    return res.json({ dataSource, ...fallbackSalesCommission, lastUpdated: new Date().toISOString() });
  } catch (err) {
    console.error("Sales commission error:", err);
    return res.status(200).json({ dataSource: "fallback", ...fallbackSalesCommission, lastUpdated: new Date().toISOString() });
  }
});

// ---------- Sales: AI suggestions ----------
const fallbackAISuggestions = {
  nextBestAction: { leadId: "L1", action: "call", reason: "High score, no contact in 2 days", priority: "high" },
  talkingPoints: [
    { leadId: "L1", points: ["Mention Camry safety ratings", "Offer test drive this week"] },
    { leadId: "L2", points: ["Discuss trade-in value", "Financing options"] },
  ],
  vehicleRecommendations: [
    { leadId: "L1", vehicles: ["Toyota Camry 2024", "Honda Accord 2024"], matchReason: "Budget and sedan preference" },
  ],
};
app.get("/api/sales/ai-suggestions", async (req, res) => {
  try {
    const dataSource = isDbConnected() ? "live" : "fallback";
    return res.json({ dataSource, ...fallbackAISuggestions, lastUpdated: new Date().toISOString() });
  } catch (err) {
    console.error("Sales ai-suggestions error:", err);
    return res.status(200).json({ dataSource: "fallback", ...fallbackAISuggestions, lastUpdated: new Date().toISOString() });
  }
});

// ---------- Sales: Follow-up scheduler ----------
const fallbackFollowUp = {
  upcoming: [
    { id: "F1", leadId: "L1", type: "call", due: "2025-03-16T14:00:00Z", leadName: "Alex Chen" },
    { id: "F2", leadId: "L2", type: "test_drive", due: "2025-03-17T10:00:00Z", leadName: "Sam Davis" },
    { id: "F3", leadId: "L3", type: "email", due: "2025-03-18T09:00:00Z", leadName: "Jordan Lee" },
  ],
  overdue: [
    { id: "F0", leadId: "L0", type: "call", due: "2025-03-14T10:00:00Z", leadName: "Past Lead" },
  ],
};
app.get("/api/sales/follow-up", async (req, res) => {
  try {
    const dataSource = isDbConnected() ? "live" : "fallback";
    return res.json({ dataSource, ...fallbackFollowUp, lastUpdated: new Date().toISOString() });
  } catch (err) {
    console.error("Sales follow-up error:", err);
    return res.status(200).json({ dataSource: "fallback", ...fallbackFollowUp, lastUpdated: new Date().toISOString() });
  }
});

// ---------- Sales: Target achievement ----------
const fallbackTargetAchievement = {
  targetUnits: 20,
  achievedUnits: 14,
  targetRevenue: 250000,
  achievedRevenue: 142000,
  daysLeftInPeriod: 15,
  progressPercent: 56.8,
  gapUnits: 6,
  gapRevenue: 108000,
  forecastAtRunRate: 18,
};
app.get("/api/sales/target-achievement", async (req, res) => {
  try {
    const dataSource = isDbConnected() ? "live" : "fallback";
    return res.json({ dataSource, ...fallbackTargetAchievement, lastUpdated: new Date().toISOString() });
  } catch (err) {
    console.error("Sales target-achievement error:", err);
    return res.status(200).json({ dataSource: "fallback", ...fallbackTargetAchievement, lastUpdated: new Date().toISOString() });
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

// Optional: trigger seed from API (same sample data as seed.js) so DB can be populated without running npm run seed
app.post("/api/seed", async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ error: "Database not connected. Set MONGODB_URI and restart the server." });
    }
    await ensureFleetExtendedSeed();
    await ensureDiagnosticTwinSeed();
    await ensureTechnicianSeed();
    return res.json({ success: true, message: "Sample data seeded (fleet, diagnostic twin, technician)." });
  } catch (err) {
    console.error("API seed error:", err);
    return res.status(500).json({ error: err.message || "Seed failed." });
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
