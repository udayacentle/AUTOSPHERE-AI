const API_BASE = '' // use Vite proxy in dev; set in production if needed

export interface DashboardData {
  driver: { id: string; name: string; email: string } | null
  vehicle: { id: string; make: string; model: string; healthScore: number; nextServiceDate: string } | null
  mobilityScore: number | null
  recentTrips: Array<{ id: string; date: string; distanceKm: number; durationMin: number; score: number }>
  nextService: { date: string; type: string; description: string } | null
  insurance: { provider: string; policyNumber: string; expiryDate: string } | null
}

export interface MobilityScoreBreakdownItem {
  label: string
  score: number
  weight: string
}

export interface MobilityScoreData {
  overall: number
  drivingBehavior: number
  vehicleCondition: number
  usagePatterns: number
  updatedAt?: string
  trend?: 'up' | 'stable' | 'down'
  previousOverall?: number
  recommendations?: string[]
  breakdown?: MobilityScoreBreakdownItem[]
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

export interface VehicleHealthComponentDetail {
  key: string
  score: number
  status: 'good' | 'fair' | 'attention'
  message: string
  label: string
  sublabel: string
}

export interface VehicleHealthData {
  vehicle: { id: string; make: string; model: string; healthScore: number } | null
  health: { engine: number; battery: number; brakesTires: number; fluids: number; electrical: number }
  lastUpdated?: string
  componentDetails?: VehicleHealthComponentDetail[]
  recommendations?: string[]
  alerts?: Array<{ id: string; component: string; score: number }>
}

export interface PredictiveMaintenanceAlertItem {
  id: string
  type: string
  component: string
  title: string
  description: string
  severity: 'high' | 'medium' | 'low'
  dueDate: string
  dueKm: number | null
  status: string
  predictedDate?: string
}

export interface PredictiveMaintenanceUpcomingService {
  date: string
  type: string
  description: string
  status: string
}

export interface PredictiveMaintenanceData {
  vehicle: { make: string; model: string; healthScore: number }
  alerts: PredictiveMaintenanceAlertItem[]
  upcomingServices: PredictiveMaintenanceUpcomingService[]
  summary: { totalAlerts: number; criticalCount: number; warningCount: number }
  lastUpdated: string
}

export interface VehicleDetailsSpecs {
  year: number
  fuelType: string
  engine: string
  transmission: string
  drivetrain: string
  bodyType?: string
  vin?: string
}

export interface VehicleDetailsLiveSnapshot {
  odometerKm: number
  fuelLevelPercent: number
  tirePressureStatus: string
  lastServiceDate: string
  nextServiceDueKm: number
  lastUpdated: string
}

export interface VehicleDocumentItem {
  type: string
  name: string
  expiryDate: string
  status: string
}

export interface VehicleDetailsData {
  vehicle: {
    id: string
    make: string
    model: string
    healthScore: number
    year?: number
    vin?: string
  } | null
  specs: VehicleDetailsSpecs
  health: { engine: number; battery: number; brakesTires: number; fluids: number; electrical: number }
  liveSnapshot: VehicleDetailsLiveSnapshot
  documents: VehicleDocumentItem[]
  recalls: RecallItem[]
  alerts: Array<{ id: string; message: string; severity: string }>
}

export interface InsurancePolicy {
  provider: string
  policyNumber: string
  expiryDate: string
  premium: number
  coverage: string
}

export interface InsuranceCoverageBreakdownItem {
  name: string
  limit: string
  premiumPortion: number
}

export interface DriverInsuranceOverviewData {
  policy: InsurancePolicy
  coverageBreakdown: InsuranceCoverageBreakdownItem[]
  calculatorRates: {
    baseLiability: number
    baseCollision: number
    baseComprehensive: number
    currency: string
    period: string
  }
  lastUpdated: string
}

export interface InsurancePremiumEstimateResult {
  estimatedPremium: number
  breakdown: Array<{ label: string; amount: number }>
  currency: string
  period: string
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

export interface FleetOrganizationItem {
  _id?: string
  id?: string
  name: string
  slug?: string
  contactEmail?: string
  contactPhone?: string
  address?: string
  status?: string
}

export interface FleetRoleItem {
  _id?: string
  id?: string
  name: string
  slug?: string
  description?: string
  permissions?: string[]
}

export interface FleetTripItem {
  id: string
  driverId: string
  date: string
  distanceKm: number
  durationMin: number
  startLocation: string
  endLocation: string
  score: number
}

export interface WeatherData {
  temp: number | null
  description: string
  code: number
}

export interface FuelEfficiencyData {
  totalDistanceKm: number
  estimatedLiters: number
  avgKmPerL: number
  totalTrips: number
  period: string
}

export interface FuelCarbonData {
  totalKgCO2: number
  petrolKgCO2: number
  dieselKgCO2: number
  electricKgCO2: number
  totalDistanceKm: number
  period: string
  factors?: Record<string, number>
}

export interface RefuelLogItem {
  id: string
  date: string
  amountLiters: number
  cost: number
  odometerKm: number
  fuelType: string
}

export interface DriverFuelCarbonData {
  weather: { temp: number | null; description: string; code: number }
  fuelEfficiency: FuelEfficiencyData
  carbon: FuelCarbonData
  refuelLog: RefuelLogItem[]
  lastUpdated: string
}

export interface RecallItem {
  Component: string
  Summary: string
  Consequence: string
  RecallDate?: string
}

export interface ServiceCenterItem {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  rating: number
  phone: string
  distanceKm?: number
}

export interface EmissionsAnalyticsData {
  totalKgCO2: number
  petrolKgCO2: number
  dieselKgCO2: number
  electricKgCO2: number
  totalDistanceKm?: number
  bySegment: Array<{ segment: string; kgCO2: number }>
  period: string
  factors?: Record<string, number>
}

export interface MobilityDistributionData {
  buckets: Array<{ range: string; count: number }>
  average: number
}

export interface ParkingRevenueData {
  months: string[]
  revenue: number[]
  currency: string
}

export interface DrivingReportTripItem {
  id: string
  date: string
  distanceKm: number
  durationMin: number
  startLocation: string
  endLocation: string
  score: number
}

export interface DrivingReportData {
  totalTrips: number
  totalDistanceKm: number
  totalDurationMin?: number
  avgScore: number
  bestScore?: number
  worstScore?: number
  period: string
  periodStart?: string
  periodEnd?: string
  recentTrips?: DrivingReportTripItem[]
}

export interface DrivingAnalyticsData {
  riskScore: number
  riskLevel: string
  behavior: { speedScore: number; brakingScore: number; turningScore: number }
  timeOfDayRisk: Array<{ period: string; label: string; riskLevel: string; score: number }>
  recommendations: string[]
}

export interface ServiceHistoryItem {
  date: string
  type: string
  description: string
  status: string
  cost: number | null
}

export interface InsurancePortfolioData {
  activePolicies: number
  totalPremium: number
  riskExposure: number
  openClaims: number
  lossRatio: number
}

export interface InsurancePolicyListItem {
  driverId: string
  provider: string
  policyNumber: string
  expiryDate: string
  premium: number
  coverage: string
}

export interface ClaimStatusTimelineStep {
  step: string
  label: string
  date: string | null
  completed: boolean
}

export interface InsuranceClaimItem {
  id: string
  driverId: string
  date: string
  amount: number
  status: string
  description?: string
  assessmentId?: string | null
  damageType?: string
  affectedParts?: string[]
  statusTimeline?: ClaimStatusTimelineStep[]
}

export interface DamageAssessmentResult {
  assessmentId: string
  damageType: string
  estimatedCost: number
  affectedParts: string[]
  severity: 'high' | 'medium' | 'low'
  confidence: number
  message: string
}

export interface InsuranceDriverRiskItem {
  driverId: string
  name: string
  riskScore: number
  mobilityScore: number
}

export interface TechnicianJobItem {
  id: string
  vehiclePlate: string
  type: string
  status: string
  priority: string
  estimatedMinutes: number
  date?: string
  description?: string
}

export interface DriverTechnicianProfileData {
  id: string
  name: string
  avatar: string | null
  rating: number
  reviewCount: number
  skills: string[]
  certifications: string[]
  phone: string
  email: string
  currentJobId: string
  currentJobType: string
  joinedAt?: string
}

export interface LiveRepairStepItem {
  id: string
  name: string
  status: 'done' | 'active' | 'pending'
  completedAt: string | null
}

export interface LiveRepairUpdateItem {
  id: string
  at: string
  text: string
}

export interface LiveRepairJobData {
  id: string
  vehiclePlate: string
  type: string
  status: string
  steps: LiveRepairStepItem[]
  estimatedMinutes: number
  startedAt: string
  estimatedCompletion: string
  description: string
  technicianName: string
  technicianId?: string
  progressPercent?: number
  lastUpdated?: string
  updates?: LiveRepairUpdateItem[]
  cost?: number | null
}

export interface DriverLiveRepairData {
  active: boolean
  message?: string | null
  job: LiveRepairJobData | null
  lastUpdated?: string
}

export interface PropertyParkingStatsData {
  months: string[]
  utilization: number[]
  revenue: number[]
  currency: string
  totalSlots: number
}

export interface ParkingLotItem {
  id: string
  name: string
  address: string
  availableSpots: number
  totalSpots: number
  pricePerHour: number
  lat: number
  lng: number
  distanceKm: string | number
}

export interface ParkingBookingItem {
  id: string
  lotId: string
  lotName: string
  address: string
  startTime: string
  endTime: string
  durationHours: number
  totalPrice: number
}

export interface DriverParkingData {
  lots: ParkingLotItem[]
  activeBooking: ParkingBookingItem | null
}

export interface EVChargingStationItem {
  id: string
  name: string
  address: string
  availableConnectors: number
  totalConnectors: number
  connectorTypes: string[]
  powerKw: number
  pricePerKwh: number
  lat: number
  lng: number
  distanceKm: string | number
}

export interface EVChargingSessionItem {
  id: string
  stationId: string
  stationName: string
  address: string
  connectorType: string
  powerKw: number
  startTime: string
  endTime: string
  durationMinutes: number
  estimatedKwh: number
  pricePerKwh: number
  totalCost: number
}

export interface EVUsageSummary {
  totalKwhThisMonth: number
  totalCostThisMonth: number
  sessionCountThisMonth: number
  lastSessionDate: string
  currency: string
}

export interface DriverEVChargingData {
  stations: EVChargingStationItem[]
  activeSession: EVChargingSessionItem | null
  usageSummary: EVUsageSummary
}

export interface EmergencyContactItem {
  id: string
  name: string
  phone: string
  type: string
  isPrimary: boolean
}

export interface EmergencyAlertItem {
  id: string
  type: 'sos' | 'accident' | 'breakdown' | 'other'
  message?: string
  severity?: string
  description?: string
  lat: number
  lng: number
  dispatchedAt?: string
  reportedAt?: string
  status: string
}

export interface DriverEmergencyData {
  emergencyContacts: EmergencyContactItem[]
  crashDetectionEnabled: boolean
  lastKnownLocation: { lat: number; lng: number; updatedAt: string }
  recentAlerts: EmergencyAlertItem[]
}

export interface RoadsideServiceTypeItem {
  id: string
  name: string
  description: string
  estimatedMin: number
}

export interface RoadsideRequestItem {
  id: string
  serviceType: string
  serviceName: string
  status: string
  requestedAt: string
  etaMinutes: number
  etaTime: string
  helperName?: string
  helperPhone?: string
  vehicleDescription?: string
  notes?: string
  location?: { lat: number; lng: number }
}

export interface DriverRoadsideData {
  serviceTypes: RoadsideServiceTypeItem[]
  activeRequest: RoadsideRequestItem | null
  recentRequests: RoadsideRequestItem[]
  lastKnownLocation: { lat: number; lng: number; address?: string; updatedAt: string }
}

export interface ResaleEstimateFactor {
  name: string
  impact: string
  detail: string
}

export interface ResaleEstimateData {
  make: string
  model: string
  year: number
  mileage: number
  condition: string
  estimatedValueLow: number
  estimatedValueHigh: number
  estimatedValueMid: number
  currency: string
  factors: ResaleEstimateFactor[]
  lastUpdated: string
}

export interface ResaleOptionsData {
  makes: string[]
  models: Record<string, string[]>
}

export interface LoanCalculationData {
  principal: number
  downPayment: number
  principalUsed: number
  ratePercent: number
  tenureYears: number
  tenureMonths: number
  emi: number
  totalPayment: number
  totalInterest: number
  currency: string
  amortizationSchedule: { month: number; emi: number; principal: number; interest: number; balance: number }[]
}

export interface LoanRatesData {
  rates: { tenureYears: number; ratePercent: number; label: string }[]
  currency: string
}

export interface MarketplaceCategoryItem {
  id: string
  name: string
  description: string
}

export interface MarketplaceListingItem {
  id: string
  categoryId: string
  title: string
  description: string
  price: number
  currency: string
  featured?: boolean
  discount?: string
}

export interface DriverMarketplaceData {
  categories: MarketplaceCategoryItem[]
  listings: MarketplaceListingItem[]
  currency: string
}

export interface GovernmentRecallsSummaryData {
  make: string
  year: number
  totalRecalls: number
  recalls: RecallItem[]
}

export interface DealerInventoryItem {
  id: string
  make: string
  model: string
  year: number
  price: number
  status: string
  plateNumber?: string
}

export interface AnalyticsTrendsData {
  months: string[]
  avgHealth?: number[]
  avgRiskScore?: number[]
}

function parseErrorResponse(text: string, status: number): string {
  if (typeof text !== 'string' || text.includes('<') || text.includes('DOCTYPE')) {
    return 'Backend may be offline or returned an error. Start the backend (npm run start in autosphere_full_production_monorepo/services/backend).'
  }
  try {
    const obj = JSON.parse(text) as { error?: string; message?: string }
    return (obj?.error ?? obj?.message ?? text) || `Request failed (${status})`
  } catch {
    return text || `Request failed (${status})`
  }
}

async function get<T>(path: string, driverId?: string): Promise<T> {
  const url = driverId ? `${API_BASE}${path}?driverId=${encodeURIComponent(driverId)}` : `${API_BASE}${path}`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(parseErrorResponse(text, res.status))
  }
  return res.json() as Promise<T>
}

function getWithQuery<T>(path: string, params: Record<string, string | number>): Promise<T> {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => search.set(k, String(v)))
  return get<T>(`${path}?${search}`)
}

async function put<T>(path: string, body: object, driverId?: string): Promise<T> {
  const url = driverId ? `${API_BASE}${path}?driverId=${encodeURIComponent(driverId)}` : `${API_BASE}${path}`
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(parseErrorResponse(text, res.status))
  }
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
  getDriverVehicleDetails: (driverId?: string) =>
    get<VehicleDetailsData>('/api/driver/vehicle-details', driverId),
  getInsurance: (driverId?: string) => get<InsurancePolicy | null>('/api/insurance', driverId),
  getDriverInsuranceOverview: (driverId?: string) =>
    get<DriverInsuranceOverviewData>('/api/driver/insurance-overview', driverId),
  getDriverInsurancePremiumEstimate: (params: { vehicleValue?: number; driverAge?: number; coverageType?: string }) =>
    getWithQuery<InsurancePremiumEstimateResult>('/api/driver/insurance-premium-estimate', {
      vehicleValue: params.vehicleValue ?? 25000,
      driverAge: params.driverAge ?? 35,
      coverageType: params.coverageType ?? 'comprehensive',
    }),
  getDriverClaims: (driverId?: string) => get<InsuranceClaimItem[]>('/api/driver/claims', driverId),
  submitDamageAssessment: (params: { imageBase64?: string; description?: string }) =>
    fetch(`${API_BASE}/api/driver/claims/assess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}))
      return data as DamageAssessmentResult
    }),
  submitClaim: (params: {
    description: string
    assessmentId?: string
    estimatedCost?: number
    damageType?: string
    affectedParts?: string[]
  }) =>
    fetch(`${API_BASE}/api/driver/claims`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}))
      if (!res.ok && (data as { success?: boolean }).success !== true) {
        const text = await res.text().catch(() => '')
        throw new Error((data as { error?: string }).error || text || 'Submit failed')
      }
      return data as { success: boolean; claim: InsuranceClaimItem }
    }),
  getProfile: (driverId?: string) => get<DriverProfile>('/api/profile', driverId),
  saveProfile: (profile: DriverProfile, driverId?: string) =>
    put<{ success: boolean }>('/api/profile', profile, driverId),

  getFleetDashboard: () => get<FleetDashboardData>('/api/fleet/dashboard'),
  getFleetVehicles: () => get<FleetVehicleItem[]>('/api/fleet/vehicles'),
  addFleetVehicle: (body: { plateNumber: string; model?: string; status?: string }) =>
    fetch(`${API_BASE}/api/fleet/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText)
        throw new Error(parseErrorResponse(text, res.status))
      }
      return res.json() as Promise<FleetVehicleItem>
    }),
  getFleetDrivers: () => get<FleetDriverItem[]>('/api/fleet/drivers'),
  getFleetMaintenance: () => get<FleetMaintenanceItem[]>('/api/fleet/maintenance'),
  getFleetReports: () => get<FleetReportItem[]>('/api/fleet/reports'),
  getFleetOrganizations: () => get<FleetOrganizationItem[]>('/api/fleet/organizations'),
  getFleetRoles: () => get<FleetRoleItem[]>('/api/fleet/roles'),
  getFleetTrips: (limit = 50) => get<FleetTripItem[]>(`/api/fleet/trips?limit=${limit}`),

  getWeather: (lat?: number, lng?: number) =>
    getWithQuery<WeatherData>('/api/weather', { lat: lat ?? 37.77, lng: lng ?? -122.41 }),
  getRecalls: (make: string, model: string, year: number) =>
    getWithQuery<RecallItem[]>('/api/recalls', { make, model, year }),
  getServiceCenters: (lat?: number, lng?: number) =>
    getWithQuery<ServiceCenterItem[]>('/api/service-centers', { lat: lat ?? 37.77, lng: lng ?? -122.41 }),
  getAnalyticsEmissions: () => get<EmissionsAnalyticsData>('/api/analytics/emissions'),
  getAnalyticsMobilityDistribution: () => get<MobilityDistributionData>('/api/analytics/mobility-distribution'),
  getAnalyticsParkingRevenue: () => get<ParkingRevenueData>('/api/analytics/parking-revenue'),

  getDrivingReports: (period: 'week' | 'month' = 'month', driverId?: string) =>
    getWithQuery<DrivingReportData>('/api/driver/driving-reports', { period, ...(driverId && { driverId }) }),
  getDrivingAnalytics: (driverId?: string) => get<DrivingAnalyticsData>('/api/driver/driving-analytics', driverId),
  getDriverPredictiveMaintenance: (driverId?: string) =>
    get<PredictiveMaintenanceData>('/api/driver/predictive-maintenance', driverId),
  getDriverFuelCarbon: (lat?: number, lng?: number, driverId?: string) => {
    const params = new URLSearchParams()
    if (lat != null) params.set('lat', String(lat))
    if (lng != null) params.set('lng', String(lng))
    if (driverId) params.set('driverId', driverId)
    const q = params.toString()
    return get<DriverFuelCarbonData>(`/api/driver/fuel-carbon${q ? `?${q}` : ''}`)
  },
  getDriverParking: (lat?: number, lng?: number) =>
    getWithQuery<DriverParkingData>('/api/driver/parking', { lat: lat ?? 37.77, lng: lng ?? -122.41 }),
  bookParkingSlot: (lotId: string, durationHours: number) =>
    fetch(`${API_BASE}/api/driver/parking/booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lotId, durationHours }),
    }).then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText)
        throw new Error(parseErrorResponse(text, res.status))
      }
      return res.json() as Promise<{ success: boolean; booking: ParkingBookingItem }>
    }),
  cancelParkingBooking: () =>
    fetch(`${API_BASE}/api/driver/parking/booking`, { method: 'DELETE' }).then(async (res) => {
      if (!res.ok) throw new Error('Failed to cancel')
      return res.json() as Promise<{ success: boolean }>
    }),
  getDriverEVCharging: (lat?: number, lng?: number) =>
    getWithQuery<DriverEVChargingData>('/api/driver/ev-charging', { lat: lat ?? 37.77, lng: lng ?? -122.41 }),
  bookEVChargingSlot: (stationId: string, connectorType: string, durationMinutes: number) =>
    fetch(`${API_BASE}/api/driver/ev-charging/booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stationId, connectorType, durationMinutes }),
    }).then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText)
        throw new Error(parseErrorResponse(text, res.status))
      }
      return res.json() as Promise<{ success: boolean; session: EVChargingSessionItem }>
    }),
  cancelEVChargingBooking: () =>
    fetch(`${API_BASE}/api/driver/ev-charging/booking`, { method: 'DELETE' }).then(async (res) => {
      if (!res.ok) throw new Error('Failed to cancel')
      return res.json() as Promise<{ success: boolean }>
    }),
  getDriverEmergency: () => get<DriverEmergencyData>('/api/driver/emergency'),
  triggerSOS: (message?: string, lat?: number, lng?: number) =>
    fetch(`${API_BASE}/api/driver/emergency/sos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, lat, lng }),
    }).then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText)
        throw new Error(parseErrorResponse(text, res.status))
      }
      return res.json() as Promise<{ success: boolean; alertId: string; dispatchedAt: string; alert: EmergencyAlertItem }>
    }),
  reportIncident: (params: { type?: string; severity?: string; description?: string; lat?: number; lng?: number }) =>
    fetch(`${API_BASE}/api/driver/emergency/incident`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }).then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText)
        throw new Error(parseErrorResponse(text, res.status))
      }
      return res.json() as Promise<{ success: boolean; incidentId: string; reportedAt: string; incident: EmergencyAlertItem }>
    }),
  updateEmergencySettings: (crashDetectionEnabled: boolean) =>
    fetch(`${API_BASE}/api/driver/emergency/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ crashDetectionEnabled }),
    }).then(async (res) => {
      if (!res.ok) throw new Error('Failed to update settings')
      return res.json() as Promise<{ success: boolean; crashDetectionEnabled: boolean }>
    }),
  getDriverRoadside: () => get<DriverRoadsideData>('/api/driver/roadside'),
  requestRoadsideAssistance: (params: { serviceType: string; vehicleDescription?: string; lat?: number; lng?: number; notes?: string }) =>
    fetch(`${API_BASE}/api/driver/roadside/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }).then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText)
        throw new Error(parseErrorResponse(text, res.status))
      }
      return res.json() as Promise<{ success: boolean; request: RoadsideRequestItem }>
    }),
  cancelRoadsideRequest: () =>
    fetch(`${API_BASE}/api/driver/roadside/request`, { method: 'DELETE' }).then(async (res) => {
      if (!res.ok) throw new Error('Failed to cancel')
      return res.json() as Promise<{ success: boolean }>
    }),
  getResaleOptions: () => get<ResaleOptionsData>('/api/driver/resale-options'),
  getResaleEstimate: (params: { make: string; model: string; year: number; mileage: number; condition: string }) =>
    getWithQuery<ResaleEstimateData>('/api/driver/resale-estimate', params),
  getLoanRates: () => get<LoanRatesData>('/api/driver/loan-rates'),
  getLoanCalculation: (params: { principal: number; downPayment?: number; rate: number; tenure: number }) =>
    getWithQuery<LoanCalculationData>('/api/driver/loan-calculate', {
      principal: params.principal,
      downPayment: params.downPayment ?? 0,
      rate: params.rate,
      tenure: params.tenure,
    }),
  getDriverMarketplace: (categoryId?: string) =>
    categoryId
      ? getWithQuery<DriverMarketplaceData>('/api/driver/marketplace', { category: categoryId })
      : get<DriverMarketplaceData>('/api/driver/marketplace'),
  getServiceHistory: (driverId?: string) => get<ServiceHistoryItem[]>('/api/driver/service-history', driverId),
  getInsurancePortfolio: () => get<InsurancePortfolioData>('/api/insurance/portfolio'),
  getInsurancePolicies: () => get<InsurancePolicyListItem[]>('/api/insurance/policies'),
  getInsuranceClaims: () => get<InsuranceClaimItem[]>('/api/insurance/claims'),
  getInsuranceDriversRisk: () => get<InsuranceDriverRiskItem[]>('/api/insurance/drivers-risk'),
  getTechnicianJobs: () => get<TechnicianJobItem[]>('/api/technician/jobs'),
  getDriverTechnicianProfile: (driverId?: string) =>
    get<DriverTechnicianProfileData>('/api/driver/technician-profile', driverId),
  getDriverLiveRepair: (driverId?: string) =>
    get<DriverLiveRepairData>('/api/driver/live-repair', driverId),
  getPropertyParkingStats: () => get<PropertyParkingStatsData>('/api/property/parking-stats'),
  getGovernmentRecallsSummary: (make?: string, year?: number) =>
    getWithQuery<GovernmentRecallsSummaryData>('/api/government/recalls-summary', { make: make ?? 'Toyota', year: year ?? 2024 }),
  getDealerInventory: () => get<DealerInventoryItem[]>('/api/dealer/inventory'),
  getAnalyticsVehicleHealthTrends: () => get<AnalyticsTrendsData>('/api/analytics/vehicle-health-trends'),
  getAnalyticsInsuranceRiskTrends: () => get<AnalyticsTrendsData>('/api/analytics/insurance-risk-trends'),
}
