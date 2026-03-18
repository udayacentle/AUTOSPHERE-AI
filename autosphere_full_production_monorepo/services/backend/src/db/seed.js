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
import FleetOrganization from "../models/FleetOrganization.js";
import FleetRole from "../models/FleetRole.js";
import FleetUser from "../models/FleetUser.js";
import VehicleDiagnosticTwin from "../models/VehicleDiagnosticTwin.js";
import TechnicianProfile from "../models/TechnicianProfile.js";
import TechnicianJobExtra from "../models/TechnicianJobExtra.js";
import TechnicianStats from "../models/TechnicianStats.js";

dotenv.config();

const DRIVER_ID = "driver1";

const sampleTrips = [
  { driverId: DRIVER_ID, date: "2025-03-12", distanceKm: 45, durationMin: 62, startLocation: "San Francisco, CA", endLocation: "SFO Airport", score: 88, status: "completed" },
  { driverId: DRIVER_ID, date: "2025-03-11", distanceKm: 23, durationMin: 35, startLocation: "Oakland", endLocation: "Downtown SF", score: 92, status: "completed" },
  { driverId: DRIVER_ID, date: "2025-03-10", distanceKm: 78, durationMin: 95, startLocation: "San Jose", endLocation: "Palo Alto", score: 85, status: "completed" },
  { driverId: DRIVER_ID, date: "2025-03-09", distanceKm: 12, durationMin: 18, startLocation: "Mission District", endLocation: "SOMA", score: 90, status: "completed" },
  { driverId: DRIVER_ID, date: "2025-03-08", distanceKm: 56, durationMin: 72, startLocation: "SFO Airport", endLocation: "Berkeley", score: 82, status: "completed" },
  { driverId: DRIVER_ID, date: "2025-03-07", distanceKm: 34, durationMin: 44, startLocation: "Sunnyvale", endLocation: "Mountain View", score: 87, status: "completed" },
];

const fleetTripsBRD = [
  { driverId: DRIVER_ID, passengerId: "user-passenger-1", date: "2025-03-12", distanceKm: 45, durationMin: 62, startLocation: "San Francisco, CA", endLocation: "SFO Airport", score: 88, status: "completed" },
  { driverId: DRIVER_ID, passengerId: "user-passenger-2", date: "2025-03-11", distanceKm: 23, durationMin: 35, startLocation: "Oakland", endLocation: "Downtown SF", score: 92, status: "completed" },
  { driverId: null, passengerId: "user-passenger-1", date: "2025-03-16", distanceKm: 0, durationMin: 0, startLocation: "Berkeley", endLocation: "Oakland", score: 0, status: "pending" },
  { driverId: null, passengerId: "user-passenger-2", date: "2025-03-17", distanceKm: 0, durationMin: 0, startLocation: "Palo Alto", endLocation: "San Jose", score: 0, status: "pending" },
  { driverId: "user-driver-1", passengerId: "user-passenger-1", date: "2025-03-15", distanceKm: 0, durationMin: 0, startLocation: "Downtown SF", endLocation: "SFO Airport", score: 0, status: "in_progress" },
];

const fleetRolesBRD = [
  { name: "Driver", slug: "driver", description: "View assigned trips; accept/reject trips; update trip status (Start, In Progress, Completed); access navigation. No access to management or reports.", permissions: ["view_vehicles:limited", "update_trip_status", "manage_trips:assigned"] },
  { name: "Passenger", slug: "passenger", description: "Book or schedule rides; track trips; view trip history; access basic billing. Limited to own data.", permissions: ["view_vehicles:limited", "book_ride", "manage_trips:own", "billing:limited"] },
  { name: "Entity Admin", slug: "entity_admin", description: "Manage vehicles, drivers, passengers; assign and monitor trips; access reports and analytics; view billing. Limited to one organization.", permissions: ["view_vehicles:full", "book_ride", "manage_trips:full", "update_trip_status", "manage_vehicles", "manage_users", "reports_analytics", "billing:full", "system_config:limited"] },
  { name: "Super Admin", slug: "super_admin", description: "Full system control; manage all organizations; configure system settings; access all reports; manage roles and permissions.", permissions: ["view_vehicles:full", "book_ride", "manage_trips:full", "update_trip_status", "manage_vehicles", "manage_users", "reports_analytics", "billing:full", "system_config:full", "multi_organization"] },
  { name: "Guest User", slug: "guest", description: "View limited public information. No booking or management access.", permissions: ["view_vehicles:limited"] },
];

const fleetOrganizationsSeed = [
  { name: "AutoSphere Fleet West", slug: "autosphere-west", contactEmail: "fleet-west@autosphere.ai", contactPhone: "+1-415-555-0100", address: "San Francisco, CA", status: "active" },
  { name: "Metro Logistics", slug: "metro-logistics", contactEmail: "admin@metrologistics.com", contactPhone: "+1-415-555-0200", address: "Oakland, CA", status: "active" },
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
  const maintenanceDocs = await FleetMaintenance.insertMany([
    { vehiclePlate: "AB-1234", type: "Oil Change", date: "2025-03-15", description: "Regular oil and filter change", status: "completed", cost: 85 },
    { vehiclePlate: "CD-5678", type: "Tire Rotation", date: "2025-03-20", description: "Rotate tires and balance", status: "scheduled", cost: null },
    { vehiclePlate: "EF-9012", type: "Brake Inspection", date: "2025-03-25", description: "Full brake pad and rotor check", status: "scheduled", cost: null },
    { vehiclePlate: "AB-1234", type: "Air Filter Replacement", date: "2025-03-18", description: "Cabin and engine air filter", status: "in_progress", cost: null },
    { vehiclePlate: "CD-5678", type: "Battery Test", date: "2025-03-22", description: "Load test and charging system check", status: "pending", cost: null },
  ]);
  console.log("Seeded Fleet maintenance");

  const technicianProfileSeed = { technicianId: "tech-001", name: "Mike Chen", email: "mike.chen@autosphere.service", workshop: "Bay 3 - West", bay: "B3", role: "Senior Technician" };
  const technicianStatsSeed = {
    technicianId: "tech-001",
    performance: { firstTimeFixRate: 94, reworkPercent: 3, customerRating: 4.8, workshopAverage: 4.2, trends: [{ period: "Jan 2025", score: 92, label: "First-time fix" }, { period: "Feb 2025", score: 93, label: "First-time fix" }, { period: "Mar 2025", score: 94, label: "First-time fix" }], goals: [{ name: "First-time fix rate", target: 95, current: 94, unit: "%" }, { name: "Rework", target: 2, current: 3, unit: "%" }, { name: "Customer rating", target: 4.8, current: 4.8, unit: "/5" }] },
    earnings: { byPeriod: [{ period: "today", label: "Today", base: 120, incentive: 20, total: 140 }, { period: "week", label: "This week", base: 680, incentive: 95, total: 775 }, { period: "month", label: "This month", base: 2840, incentive: 420, total: 3260 }], byJobType: [{ jobType: "Oil Change", labourUnits: 0.5, amount: 42, count: 12 }, { jobType: "Brake Service", labourUnits: 2, amount: 280, count: 3 }, { jobType: "Diagnostics", labourUnits: 1, amount: 95, count: 5 }], payouts: [{ date: "2025-03-01", amount: 3180, status: "paid", method: "Direct deposit" }, { date: "2025-02-28", amount: 3020, status: "paid", method: "Direct deposit" }], nextPayDate: "2025-03-31", pendingAmount: 775 },
  };
  const jobExtra = (jobId, vehiclePlate, jobType) => ({
    jobId,
    vehiclePlate,
    jobType,
    faultDetection: { faults: [{ fault: "Catalyst efficiency below threshold", cause: "Aging O2 sensor or exhaust leak", confidence: 0.88, evidence: "P0420, O2 readings" }, { fault: "System too lean", cause: "Vacuum leak or MAF", confidence: 0.72, evidence: "P0171, fuel trim" }], rootCause: { primary: "O2 sensor Bank 1", contributing: ["Possible exhaust leak", "MAF may need cleaning"] }, similarCases: [{ caseId: "C-2024-112", vehiclePlate: "XY-9999", summary: "P0420 on Camry", outcome: "Replaced O2 sensor" }] },
    repairRecommendations: { steps: [{ order: 1, name: "Inspect", description: "Check O2 sensor and exhaust for leaks", durationMin: 15 }, { order: 2, name: "Replace/Repair", description: "Replace O2 sensor or repair leak", durationMin: 45 }, { order: 3, name: "Test", description: "Clear codes, test drive, verify", durationMin: 20 }], parts: [{ partNumber: "89465-0D210", name: "O2 Sensor Bank 1", quantity: 1, inStock: true, unitPrice: 89 }, { partNumber: "17801-0Y060", name: "Air filter", quantity: 1, inStock: true, unitPrice: 24 }], labourMinutes: 80, manualLinks: [{ title: "O2 sensor replacement - Toyota TS", url: "/manuals/toyota-o2-replace" }, { title: "P0420 diagnostic tree", url: "/manuals/p0420" }] },
    partsPrediction: { predicted: [{ partNumber: "89465-0D210", name: "O2 Sensor Bank 1", quantity: 1, inStock: true, unitPrice: 89 }, { partNumber: "17801-0Y060", name: "Air filter", quantity: 1, inStock: true, unitPrice: 24 }], stock: [{ partNumber: "89465-0D210", name: "O2 Sensor Bank 1", quantity: 4, location: "Aisle 12" }, { partNumber: "17801-0Y060", name: "Air filter", quantity: 12, location: "Aisle 5" }], alternatives: [{ partNumber: "OX-234", name: "O2 Sensor (aftermarket)", oemPartNumber: "89465-0D210", aftermarket: true }] },
    workflow: { stages: [{ id: "diagnose", name: "Diagnose", status: "done", estimatedMin: 15, actualMin: 12, startedAt: new Date(), completedAt: new Date() }, { id: "parts", name: "Parts", status: "done", estimatedMin: 10, actualMin: 8, startedAt: new Date(), completedAt: new Date() }, { id: "repair", name: "Repair", status: "active", estimatedMin: 45, actualMin: null, startedAt: new Date(), completedAt: null }, { id: "test", name: "Test", status: "pending", estimatedMin: 20, actualMin: null, startedAt: null, completedAt: null }, { id: "complete", name: "Complete", status: "pending", estimatedMin: 5, actualMin: null, startedAt: null, completedAt: null }] },
    timeEstimate: { estimatedMinutes: 80, actualMinutes: 20, eta: new Date(Date.now() + 60 * 60 * 1000), startedAt: new Date() },
    arSteps: [{ order: 1, title: "Locate O2 sensor", instruction: "Point camera at exhaust manifold. Sensor is before catalytic converter.", highlightComponent: "O2_Bank1" }, { order: 2, title: "Disconnect", instruction: "Unplug electrical connector. Remove sensor with 22mm wrench.", highlightComponent: "O2_connector" }, { order: 3, title: "Install", instruction: "Apply anti-seize to threads. Torque to 35 Nm.", highlightComponent: "O2_Bank1" }],
  });
  await TechnicianProfile.deleteMany({}).catch(() => {});
  await TechnicianProfile.create(technicianProfileSeed);
  console.log("Seeded TechnicianProfile");
  await TechnicianStats.deleteMany({}).catch(() => {});
  await TechnicianStats.create(technicianStatsSeed);
  console.log("Seeded TechnicianStats");
  await TechnicianJobExtra.deleteMany({}).catch(() => {});
  for (let i = 0; i < maintenanceDocs.length; i++) {
    const m = maintenanceDocs[i];
    const extra = jobExtra(m._id.toString(), m.vehiclePlate, m.type);
    if (i === 1) {
      extra.faultDetection = { faults: [{ fault: "Cylinder 2 misfire", cause: "Ignition coil or plug", confidence: 0.91, evidence: "P0302" }], rootCause: { primary: "Ignition coil #2", contributing: [] }, similarCases: [{ caseId: "C-2024-098", vehiclePlate: "CD-0000", summary: "P0302 Sprinter", outcome: "Replaced coil" }] };
      extra.repairRecommendations.steps = [{ order: 1, name: "Test coil", description: "Swap coil 2 with 3, recheck", durationMin: 10 }, { order: 2, name: "Replace coil", description: "Replace faulty ignition coil", durationMin: 25 }];
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
        similarCases: [{ caseId: "C-2024-201", vehiclePlate: "GH-5555", summary: "Hiace front brakes", outcome: "Pads and rotors replaced" }],
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
  console.log("Seeded TechnicianJobExtra");

  await FleetReport.deleteMany({}).catch(() => {});
  await FleetReport.insertMany([
    { period: "March 2025", totalTrips: 120, totalDistanceKm: 2450, totalFuelUsed: 320, maintenanceCount: 5, alerts: 2 },
    { period: "February 2025", totalTrips: 98, totalDistanceKm: 2100, totalFuelUsed: 280, maintenanceCount: 3, alerts: 0 },
  ]);
  console.log("Seeded Fleet reports");

  await FleetOrganization.deleteMany({}).catch(() => {});
  const orgs = await FleetOrganization.insertMany(fleetOrganizationsSeed);
  console.log("Seeded Fleet organizations (BRD)");

  await FleetRole.deleteMany({}).catch(() => {});
  await FleetRole.insertMany(fleetRolesBRD);
  console.log("Seeded Fleet roles (BRD)");

  await FleetUser.deleteMany({}).catch(() => {});
  const firstOrgId = orgs[0] && orgs[0]._id;
  const fleetUsersSeed = [
    { userId: "user-super-1", email: "admin@autosphere.ai", fullName: "System Super Admin", roleSlug: "super_admin", organizationId: null, status: "active" },
    { userId: "user-entity-1", email: "fleet.admin@autosphere-west.com", fullName: "Jane Fleet Admin", roleSlug: "entity_admin", organizationId: firstOrgId, status: "active" },
    { userId: "user-driver-1", email: "james.w@fleet.com", fullName: "James Wilson", roleSlug: "driver", organizationId: firstOrgId, status: "active" },
    { userId: "user-driver-2", email: "maria.s@fleet.com", fullName: "Maria Santos", roleSlug: "driver", organizationId: firstOrgId, status: "active" },
    { userId: "user-passenger-1", email: "passenger1@example.com", fullName: "Alex Rider", roleSlug: "passenger", organizationId: firstOrgId, status: "active" },
    { userId: "user-passenger-2", email: "passenger2@example.com", fullName: "Sam Carter", roleSlug: "passenger", organizationId: firstOrgId, status: "active" },
    { userId: "user-guest-1", email: "guest@example.com", fullName: "Guest Viewer", roleSlug: "guest", organizationId: firstOrgId, status: "active" },
  ];
  await FleetUser.insertMany(fleetUsersSeed);
  console.log("Seeded Fleet users (BRD roles)");

  await Trip.insertMany(fleetTripsBRD);
  console.log("Seeded Fleet trips (BRD status/passenger)");

  const diagnosticTwinSeed = [
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
  await VehicleDiagnosticTwin.deleteMany({}).catch(() => {});
  await VehicleDiagnosticTwin.insertMany(diagnosticTwinSeed);
  console.log("Seeded VehicleDiagnosticTwin");

  await mongoose.disconnect();
  console.log("Seed complete. Disconnected.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
