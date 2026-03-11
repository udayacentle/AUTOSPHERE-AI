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
  getDashboard: (driverId?: string) => get<DashboardData>('/api/dashboard', driverId),
  getMobilityScore: (driverId?: string) => get<MobilityScoreData>('/api/mobility-score', driverId),
  getTrips: (driverId?: string, limit = 20) => {
    const params = new URLSearchParams({ limit: String(limit) })
    if (driverId) params.set('driverId', driverId)
    return get<Trip[]>(`/api/trips?${params}`)
  },
  getVehicleHealth: (driverId?: string) => get<VehicleHealthData>('/api/vehicle-health', driverId),
  getInsurance: (driverId?: string) => get<InsurancePolicy | null>('/api/insurance', driverId),
  getProfile: (driverId?: string) => get<DriverProfile>('/api/profile', driverId),
  saveProfile: (profile: DriverProfile, driverId?: string) =>
    put<{ success: boolean }>('/api/profile', profile, driverId),
}
