const API_BASE = '' // use Vite proxy in dev; set in production if needed

export interface DashboardData {
  driver: { id: string; name: string; email: string } | null
  vehicle: { id: string; make: string; model: string; healthScore: number; nextServiceDate: string } | null
  mobilityScore: number | null
  recentTrips: Array<{ id: string; date: string; distanceKm: number; durationMin: number; score: number }>
  nextService: { date: string; type: string; description: string } | null
  insurance: { provider: string; policyNumber: string; expiryDate: string } | null
}

export interface MobilityScoreData {
  overall: number
  drivingBehavior: number
  vehicleCondition: number
  usagePatterns: number
  updatedAt?: string
}

export interface Trip {
  id: string
  date: string
  distanceKm: number
  durationMin: number
  startLocation: string
  endLocation: string
  score: number
}

export interface VehicleHealthData {
  vehicle: { id: string; make: string; model: string; healthScore: number } | null
  health: { engine: number; battery: number; brakesTires: number; fluids: number; electrical: number }
}

export interface InsurancePolicy {
  provider: string
  policyNumber: string
  expiryDate: string
  premium: number
  coverage: string
}

export interface DriverProfile {
  username: string
  fullName: string
  email: string
  phoneCode: string
  phone: string
  licenseNumber: string
  distanceUnits: string
  language: string
  emailNotifications: boolean
  pushNotifications: boolean
}

export interface FleetDashboardData {
  trips: number
  fuel: number
  maintenance: number
  vehicleCount?: number
}

export interface FleetVehicleItem {
  _id?: string
  id?: string
  plateNumber: string
  model: string
  status: string
  latitude: number | null
  longitude: number | null
}

const FALLBACK_FLEET_DASHBOARD: FleetDashboardData = { trips: 120, fuel: 80, maintenance: 30 }
const FALLBACK_FLEET_VEHICLES: FleetVehicleItem[] = [
  { _id: 'fallback-1', plateNumber: 'AB-1234', model: 'Ford Transit', status: 'active', latitude: 37.77, longitude: -122.41 },
  { _id: 'fallback-2', plateNumber: 'CD-5678', model: 'Mercedes Sprinter', status: 'active', latitude: 37.78, longitude: -122.42 },
  { _id: 'fallback-3', plateNumber: 'EF-9012', model: 'Toyota Hiace', status: 'maintenance', latitude: null, longitude: null },
]

export interface FleetDriverItem {
  _id?: string
  id?: string
  name: string
  licenseId: string
  assignedVehiclePlate: string
  status: string
  contact: string
}

export interface FleetMaintenanceItem {
  _id?: string
  id?: string
  vehiclePlate: string
  type: string
  date: string
  description: string
  status: string
  cost: number | null
}

export interface FleetReportItem {
  _id?: string
  id?: string
  period: string
  totalTrips: number
  totalDistanceKm: number
  totalFuelUsed: number
  maintenanceCount: number
  alerts: number
}

const FALLBACK_FLEET_DRIVERS: FleetDriverItem[] = [
  { _id: 'fd1', name: 'James Wilson', licenseId: 'DL-2023-1001', assignedVehiclePlate: 'AB-1234', status: 'active', contact: 'james.w@fleet.com' },
  { _id: 'fd2', name: 'Maria Santos', licenseId: 'DL-2023-1002', assignedVehiclePlate: 'CD-5678', status: 'active', contact: 'maria.s@fleet.com' },
  { _id: 'fd3', name: 'David Chen', licenseId: 'DL-2023-1003', assignedVehiclePlate: '', status: 'available', contact: 'david.c@fleet.com' },
]
const FALLBACK_FLEET_MAINTENANCE: FleetMaintenanceItem[] = [
  { vehiclePlate: 'AB-1234', type: 'Oil Change', date: '2025-03-15', description: 'Regular oil and filter change', status: 'completed', cost: 85 },
  { vehiclePlate: 'CD-5678', type: 'Tire Rotation', date: '2025-03-20', description: 'Rotate tires and balance', status: 'scheduled', cost: null },
  { vehiclePlate: 'EF-9012', type: 'Brake Inspection', date: '2025-03-25', description: 'Full brake pad and rotor check', status: 'scheduled', cost: null },
]
const FALLBACK_FLEET_REPORTS: FleetReportItem[] = [
  { period: 'March 2025', totalTrips: 120, totalDistanceKm: 2450, totalFuelUsed: 320, maintenanceCount: 5, alerts: 2 },
  { period: 'February 2025', totalTrips: 98, totalDistanceKm: 2100, totalFuelUsed: 280, maintenanceCount: 3, alerts: 0 },
]

const FALLBACK_DASHBOARD: DashboardData = {
  driver: { id: 'driver1', name: 'Alex Rivera', email: 'test@example.com' },
  vehicle: { id: 'v1', make: 'Toyota', model: 'Camry 2024', healthScore: 87, nextServiceDate: '2025-04-20' },
  mobilityScore: 86,
  recentTrips: [
    { id: '1', date: '2025-03-12', distanceKm: 45, durationMin: 62, score: 88 },
    { id: '2', date: '2025-03-11', distanceKm: 23, durationMin: 35, score: 92 },
  ],
  nextService: { date: '2025-04-20', type: 'Oil Change', description: 'Scheduled oil change and filter replacement.' },
  insurance: { provider: 'AutoSafe Insurance', policyNumber: 'POL-2024-45678', expiryDate: '2025-09-15' },
}
const FALLBACK_MOBILITY: MobilityScoreData = { overall: 86, drivingBehavior: 88, vehicleCondition: 87, usagePatterns: 83 }
const FALLBACK_TRIPS: Trip[] = [
  { id: '1', date: '2025-03-12', distanceKm: 45, durationMin: 62, startLocation: 'Downtown', endLocation: 'Airport', score: 88 },
  { id: '2', date: '2025-03-11', distanceKm: 23, durationMin: 35, startLocation: 'Home', endLocation: 'Office', score: 92 },
]
const FALLBACK_VEHICLE_HEALTH: VehicleHealthData = {
  vehicle: { id: 'v1', make: 'Toyota', model: 'Camry 2024', healthScore: 87 },
  health: { engine: 90, battery: 85, brakesTires: 88, fluids: 82, electrical: 92 },
}
const FALLBACK_INSURANCE: InsurancePolicy = {
  provider: 'AutoSafe Insurance', policyNumber: 'POL-2024-45678', expiryDate: '2025-09-15', premium: 1200, coverage: 'Comprehensive',
}

async function get<T>(path: string, driverId?: string): Promise<T> {
  const url = driverId ? `${API_BASE}${path}?driverId=${encodeURIComponent(driverId)}` : `${API_BASE}${path}`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText))
  return res.json() as Promise<T>
}

async function put<T>(path: string, body: object, driverId?: string): Promise<T> {
  const url = driverId ? `${API_BASE}${path}?driverId=${encodeURIComponent(driverId)}` : `${API_BASE}${path}`
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText))
  return res.json() as Promise<T>
}

export const api = {
  getDashboard: async (driverId?: string): Promise<DashboardData> => {
    try { return await get<DashboardData>('/api/dashboard', driverId) } catch { return FALLBACK_DASHBOARD }
  },
  getMobilityScore: async (driverId?: string): Promise<MobilityScoreData> => {
    try { return await get<MobilityScoreData>('/api/mobility-score', driverId) } catch { return FALLBACK_MOBILITY }
  },
  getTrips: async (driverId?: string, limit = 20): Promise<Trip[]> => {
    try {
      const params = new URLSearchParams({ limit: String(limit) })
      if (driverId) params.set('driverId', driverId)
      return await get<Trip[]>(`/api/trips?${params}`)
    } catch { return FALLBACK_TRIPS }
  },
  getVehicleHealth: async (driverId?: string): Promise<VehicleHealthData> => {
    try { return await get<VehicleHealthData>('/api/vehicle-health', driverId) } catch { return FALLBACK_VEHICLE_HEALTH }
  },
  getInsurance: async (driverId?: string): Promise<InsurancePolicy | null> => {
    try { return await get<InsurancePolicy | null>('/api/insurance', driverId) } catch { return FALLBACK_INSURANCE }
  },
  getProfile: (driverId?: string) => get<DriverProfile>('/api/profile', driverId),
  saveProfile: (profile: DriverProfile, driverId?: string) =>
    put<{ success: boolean }>('/api/profile', profile, driverId),

  getFleetDashboard: async (): Promise<FleetDashboardData> => {
    try {
      return await get<FleetDashboardData>('/api/fleet/dashboard')
    } catch {
      return FALLBACK_FLEET_DASHBOARD
    }
  },
  getFleetVehicles: async (): Promise<FleetVehicleItem[]> => {
    try {
      return await get<FleetVehicleItem[]>('/api/fleet/vehicles')
    } catch {
      return FALLBACK_FLEET_VEHICLES
    }
  },
  addFleetVehicle: (body: { plateNumber: string; model?: string; status?: string }) =>
    fetch(`${API_BASE}/api/fleet/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((res) => {
      if (!res.ok) throw new Error(res.statusText)
      return res.json() as Promise<FleetVehicleItem>
    }),

  getFleetDrivers: async (): Promise<FleetDriverItem[]> => {
    try { return await get<FleetDriverItem[]>('/api/fleet/drivers') } catch { return FALLBACK_FLEET_DRIVERS }
  },
  getFleetMaintenance: async (): Promise<FleetMaintenanceItem[]> => {
    try { return await get<FleetMaintenanceItem[]>('/api/fleet/maintenance') } catch { return FALLBACK_FLEET_MAINTENANCE }
  },
  getFleetReports: async (): Promise<FleetReportItem[]> => {
    try { return await get<FleetReportItem[]>('/api/fleet/reports') } catch { return FALLBACK_FLEET_REPORTS }
  },
}
