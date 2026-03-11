const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
app.use(cors({ origin: true }));
app.use(bodyParser.json());

const SECRET = process.env.JWT_SECRET || 'AUTOSPHERE_SECRET';
const DEFAULT_DRIVER_ID = 'driver1';

// In-memory profile store (no database). Replace with DB when you add it.
const profileStore = new Map();

function getDriverId(req) {
  return req.query.driverId || DEFAULT_DRIVER_ID;
}

// Empty responses until you add a database. Wire these routes to your DB to show real data.
const emptyDashboard = {
  driver: null,
  vehicle: null,
  mobilityScore: null,
  recentTrips: [],
  nextService: null,
  insurance: null,
};

const emptyMobilityScore = { overall: 0, drivingBehavior: 0, vehicleCondition: 0, usagePatterns: 0 };

const emptyVehicleHealth = {
  vehicle: null,
  health: { engine: 0, battery: 0, brakesTires: 0, fluids: 0, electrical: 0 },
};

const emptyProfile = {
  username: '',
  fullName: '',
  email: '',
  phoneCode: '+91',
  phone: '',
  licenseNumber: '',
  distanceUnits: 'km',
  language: 'en',
  emailNotifications: true,
  pushNotifications: false,
};

app.post('/auth/login', (req, res) => {
  const { email } = req.body;
  const token = jwt.sign({ email }, SECRET, { expiresIn: '1h' });
  res.json({ token });
});

app.get('/vehicles/1', (req, res) => {
  res.json({ mobilityScore: 870 });
});

app.get('/api/dashboard', (req, res) => {
  res.json(emptyDashboard);
});

app.get('/api/mobility-score', (req, res) => {
  res.json(emptyMobilityScore);
});

app.get('/api/trips', (req, res) => {
  res.json([]);
});

app.get('/api/vehicle-health', (req, res) => {
  res.json(emptyVehicleHealth);
});

app.get('/api/insurance', (req, res) => {
  res.json(null);
});

app.get('/api/drivers', (req, res) => {
  res.json([]);
});

app.get('/api/profile', (req, res) => {
  const driverId = getDriverId(req);
  const saved = profileStore.get(driverId);
  const profile = saved ? { ...emptyProfile, ...saved } : emptyProfile;
  res.json(profile);
});

app.put('/api/profile', (req, res) => {
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
    pushNotifications,
  } = req.body;
  profileStore.set(driverId, {
    username: username ?? '',
    fullName: fullName ?? '',
    email: email ?? '',
    phoneCode: phoneCode ?? '+91',
    phone: phone ?? '',
    licenseNumber: licenseNumber ?? '',
    distanceUnits: distanceUnits ?? 'km',
    language: language ?? 'en',
    emailNotifications: emailNotifications !== false,
    pushNotifications: pushNotifications === true,
  });
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on ${PORT} (no database)`));
