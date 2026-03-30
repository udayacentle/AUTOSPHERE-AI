import { API_BASE } from '../config/api'

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
  driverId: string | null
  passengerId?: string | null
  date: string
  distanceKm: number
  durationMin: number
  startLocation: string
  endLocation: string
  score: number
  status?: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'rejected'
  vehicleId?: string | null
}

export interface FleetPermissionsMatrix {
  roles: string[]
  features: Array<{
    id: string
    name: string
    driver: string
    passenger: string
    entity_admin: string
    super_admin: string
    guest: string
  }>
  principles: string[]
}

export interface FleetUserItem {
  _id?: string
  id?: string
  userId: string
  email?: string
  fullName?: string
  roleSlug: string
  organizationId?: { _id: string; name?: string; slug?: string } | null
  status?: string
}

export interface FleetActivityLogItem {
  _id?: string
  id?: string
  action: string
  summary: string
  actorUserId?: string
  targetType?: string
  targetId?: string
  meta?: Record<string, unknown>
  createdAt?: string
}

export interface FleetPublicVehiclesResponse {
  vehicles: Array<{ plateNumber: string; model: string; availability: string }>
  notice: string
}

export interface FleetPassengerBillingData {
  passengerId: string
  currency: string
  lines: Array<{ id: string; date: string; description: string; amount: number; status: string }>
  balanceDue: number
  lastInvoiceUrl?: string
}

export interface FleetSystemSettingsData {
  siteName: string
  maintenanceWindowUtc: string
  dataRetentionDays: number
  requireMfaForAdmins: boolean
  complianceNote: string
}

export interface FleetFuelLogItem {
  _id?: string
  id?: string
  vehiclePlate: string
  date: string
  liters: number
  pricePerLiter: number
  totalCost: number
  odometerKm: number
  fuelType: string
  station?: string
  recordedBy?: string
}

export interface FleetAlertItem {
  _id?: string
  id?: string
  type: string
  severity: 'low' | 'medium' | 'high'
  vehiclePlate?: string
  driverId?: string
  message: string
  status: 'open' | 'resolved'
  source?: string
  createdAtIso?: string
  createdAt?: string
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

export interface InsurancePortfolioCoverageItem {
  coverage: string
  count: number
  premium: number
}

export interface InsurancePortfolioTrendItem {
  month: string
  premium: number
}

export interface InsurancePortfolioRiskItem {
  driverId: string
  name: string
  riskScore: number
  mobilityScore: number
}

export interface InsurancePortfolioClaimItem {
  id: string
  driverId: string
  date: string
  amount: number
  status: string
  description?: string
}

export interface InsurancePortfolioExpiringItem {
  driverId: string
  provider: string
  policyNumber: string
  expiryDate: string
}

export interface InsurancePortfolioData {
  dataSource?: 'live' | 'fallback'
  activePolicies: number
  totalPremium: number
  riskExposure: number
  openClaims: number
  lossRatio: number
  premiumByCoverage?: InsurancePortfolioCoverageItem[]
  premiumTrend?: InsurancePortfolioTrendItem[]
  topRisks?: InsurancePortfolioRiskItem[]
  recentClaims?: InsurancePortfolioClaimItem[]
  policiesExpiringSoon?: InsurancePortfolioExpiringItem[]
  lastUpdated?: string
}

export interface InsuranceRealTimeRiskAlert {
  type: string
  id: string
  message: string
}

export interface InsuranceRealTimeRiskSummary {
  totalDrivers: number
  totalOpenClaims: number
  highRiskCount: number
}

export interface InsuranceRealTimeRiskData {
  dataSource?: 'live' | 'fallback'
  riskExposure: number
  riskLevel: 'high' | 'medium' | 'low'
  openClaims: number
  lossRatio: number
  openClaimsList: Array<{ id: string; driverId: string; date: string; amount: number; status: string; description?: string }>
  driversRisk: InsuranceDriverRiskItem[]
  alerts: InsuranceRealTimeRiskAlert[]
  summary?: InsuranceRealTimeRiskSummary
  lastUpdated: string
}

export interface InsurancePolicyListItem {
  driverId: string
  provider: string
  policyNumber: string
  expiryDate: string
  premium: number
  coverage: string
  driverName?: string
}

export interface InsurancePoliciesSummary {
  totalPolicies: number
  totalPremium: number
  expiringSoonCount: number
}

export interface InsurancePoliciesData {
  dataSource?: 'live' | 'fallback'
  policies: InsurancePolicyListItem[]
  summary: InsurancePoliciesSummary
  lastUpdated?: string
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
  driverName?: string
}

export interface InsuranceClaimsSummary {
  openCount: number
  paidCount: number
  totalPaidAmount: number
  totalClaims: number
}

export interface InsuranceClaimsData {
  dataSource?: 'live' | 'fallback'
  claims: InsuranceClaimItem[]
  summary: InsuranceClaimsSummary
  lastUpdated?: string
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
  email?: string
  claimCount?: number
  policyProvider?: string
  policyExpiry?: string
}

export interface InsuranceDriversRiskData {
  dataSource?: 'live' | 'fallback'
  drivers: InsuranceDriverRiskItem[]
  lastUpdated?: string
}

export interface PremiumRiskBand {
  minScore: number
  maxScore: number
  label: string
  surchargePercent: number
}

export interface PremiumDiscountOrSurcharge {
  id: string
  name: string
  condition: string
  percent: number
}

export interface PremiumRules {
  riskBands: PremiumRiskBand[]
  discounts: PremiumDiscountOrSurcharge[]
  surcharges: PremiumDiscountOrSurcharge[]
}

export interface PremiumSegment {
  segmentType: string
  segmentValue: string
  policyCount: number
  totalPremium: number
  averagePremium: number
}

export interface DynamicPremiumSummary {
  totalPremium: number
  activePolicies: number
  lossRatio: number
  totalClaimsPaid: number
}

export interface InsuranceDynamicPremiumData {
  dataSource?: 'live' | 'fallback'
  rules: PremiumRules
  segments: PremiumSegment[]
  summary: DynamicPremiumSummary
  lastUpdated?: string
}

export interface InsuranceFraudRiskFlag {
  claimId: string
  driverId: string
  driverName: string
  fraudScore: number
  flags: string[]
  amount: number
  date: string
}

export interface InsuranceFraudQueueItem {
  claimId: string
  driverId: string
  driverName: string
  fraudScore: number
  reason: string
  priority: 'high' | 'medium' | 'low'
}

export interface InsuranceFraudGraphNode {
  id: string
  type: 'driver' | 'claim'
  label: string
}

export interface InsuranceFraudGraphEdge {
  from: string
  to: string
  type: string
}

export interface InsuranceFraudDetectionData {
  dataSource?: 'live' | 'fallback'
  summary: { totalClaimsAnalyzed: number; highRiskCount: number; inInvestigationCount: number }
  riskFlags: InsuranceFraudRiskFlag[]
  investigationQueue: InsuranceFraudQueueItem[]
  graph: { nodes: InsuranceFraudGraphNode[]; edges: InsuranceFraudGraphEdge[] }
  lastUpdated?: string
}

export interface RiskHeatmapRegionBucket {
  regionKey: string
  regionLabel: string
  claimCount: number
  totalAmount: number
  riskLevel: 'low' | 'medium' | 'high'
}

export interface RiskHeatmapTimeBucket {
  periodKey: string
  periodLabel: string
  claimCount: number
  totalAmount: number
  riskLevel: 'low' | 'medium' | 'high'
}

export interface RiskHeatmapSegmentBucket {
  segmentKey: string
  segmentLabel: string
  claimCount: number
  totalAmount: number
  riskLevel: 'low' | 'medium' | 'high'
}

export interface InsuranceRiskHeatmapsData {
  dataSource?: 'live' | 'fallback'
  regionHeatmap: RiskHeatmapRegionBucket[]
  timeHeatmap: RiskHeatmapTimeBucket[]
  segmentHeatmap: RiskHeatmapSegmentBucket[]
  lastUpdated?: string
}

export interface LossForecastItem {
  periodKey: string
  periodLabel: string
  expectedLoss: number
  claimCount: number
}

export interface ReserveRecommendations {
  openClaimsReserve: number
  ibnrRecommendation: number
  caseReserveRecommendation: number
}

export interface LossScenarioItem {
  id: string
  name: string
  description: string
  projectedLossRatio: number
  projectedTotalLoss: number
}

export interface InsurancePredictiveLossForecastingData {
  dataSource?: 'live' | 'fallback'
  lossForecast: LossForecastItem[]
  reserveRecommendations: ReserveRecommendations
  scenarioAnalysis: LossScenarioItem[]
  summary?: { totalPremium: number; paidToDate: number; openClaimsCount: number }
  lastUpdated?: string
}

export interface ModelMetricsItem {
  modelId: string
  modelName: string
  accuracy: number
  precision: number
  recall: number
  auc: number
  sampleSize?: number
}

export interface DriftDetectionData {
  riskInputDrift: number
  riskPredictionDrift: number
  fraudInputDrift: number
  fraudPredictionDrift: number
}

export interface ModelVersionItem {
  versionId: string
  name: string
  deployedAt: string
  accuracy: number
  status: 'active' | 'deprecated'
}

export interface InsuranceModelPerformanceData {
  dataSource?: 'live' | 'fallback'
  modelMetrics: ModelMetricsItem[]
  driftDetection: DriftDetectionData
  versionHistory: ModelVersionItem[]
  lastUpdated?: string
}

export interface RegulatoryReportItem {
  reportId: string
  name: string
  jurisdiction: string
  dueDate: string
  status: 'due' | 'filed' | 'upcoming'
  period: string
}

export interface AuditTrailItem {
  id: string
  type: 'claim' | 'policy'
  action: string
  entityId: string
  at: string
  detail: string
}

export interface ExportOptionItem {
  format: string
  reportType: string
  description: string
}

export interface InsuranceComplianceReportingData {
  dataSource?: 'live' | 'fallback'
  regulatoryReports: RegulatoryReportItem[]
  auditTrail: AuditTrailItem[]
  exportOptions: ExportOptionItem[]
  summary?: { totalReportsDue: number; lastAuditAt: string; totalRegulatoryReports: number }
  lastUpdated?: string
}

export interface ApiEndpointItem {
  id: string
  name: string
  type: 'autosphere' | 'telematics' | 'third-party'
  status: 'active' | 'inactive'
  baseUrlMasked: string
  lastUsed: string | null
}

export interface WebhookItem {
  id: string
  eventType: string
  urlMasked: string
  status: 'active' | 'inactive'
  lastTriggered: string | null
}

export interface RateLimitItem {
  product: string
  limit: number
  used: number
  remaining: number
}

export interface InsuranceApiIntegrationSettingsData {
  dataSource?: 'live' | 'fallback'
  apiEndpoints: ApiEndpointItem[]
  webhooks: WebhookItem[]
  rateLimits: { period: string; items: RateLimitItem[] }
  lastUpdated?: string
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

export interface DiagnosticCodeItem {
  code: string
  type: string
  description: string
  severity: 'critical' | 'warning' | 'info'
  status: string
  firstSeenAt: string
  relatedRepairId: string | null
}

export interface DiagnosticSensorReading {
  name: string
  value: number | string
  unit: string
  status: 'normal' | 'warning' | 'critical'
  readAt: string
}

export interface DiagnosticServiceRecord {
  date: string
  type: string
  description: string
  mileageKm: number | null
  partsReplaced: string[]
  cost: number | null
  provider: string
}

export interface VehicleDiagnosticTwinData {
  vehicleId: string
  vin: string
  plateNumber: string
  make: string
  model: string
  year: number
  odometerKm: number
  healthScore: number
  health: { engine: number; battery: number; brakesTires: number; fluids: number; electrical: number }
  diagnosticCodes: DiagnosticCodeItem[]
  sensorData: DiagnosticSensorReading[]
  serviceHistory: DiagnosticServiceRecord[]
  lastScanAt: string
}

export interface VehicleDiagnosticTwinListItem {
  vehicleId: string
  vin?: string
  plateNumber: string
  make: string
  model: string
  year: number
  healthScore: number
  lastScanAt?: string
}

export interface TechnicianProfileData {
  technicianId: string
  name: string
  email: string
  workshop: string
  bay: string
  role: string
}

export interface TechnicianAiFaultItem {
  fault: string
  cause: string
  confidence: number
  evidence: string
}

export interface TechnicianAiFaultsData {
  faults: TechnicianAiFaultItem[]
  rootCause: { primary: string; contributing: string[] }
  similarCases: Array<{ caseId: string; vehiclePlate: string; summary: string; outcome: string }>
}

export interface TechnicianRepairStep {
  order: number
  name: string
  description: string
  durationMin: number
}

export interface TechnicianPartItem {
  partNumber: string
  name: string
  quantity: number
  inStock: boolean
  unitPrice: number
}

export interface TechnicianRepairRecommendationsData {
  steps: TechnicianRepairStep[]
  parts: TechnicianPartItem[]
  labourMinutes: number
  manualLinks: Array<{ title: string; url: string }>
}

export interface TechnicianPartsPredictionData {
  predicted: TechnicianPartItem[]
  stock: Array<{ partNumber: string; name: string; quantity: number; location: string }>
  alternatives: Array<{ partNumber: string; name: string; oemPartNumber: string; aftermarket: boolean }>
}

export interface TechnicianWorkflowStage {
  id: string
  name: string
  status: string
  estimatedMin: number
  actualMin: number | null
  startedAt: string | null
  completedAt: string | null
}

export interface TechnicianWorkflowData {
  stages: TechnicianWorkflowStage[]
}

export interface TechnicianTimeEstimateData {
  estimatedMinutes: number
  actualMinutes: number | null
  eta: string | null
  startedAt: string | null
}

export interface TechnicianArStep {
  order: number
  title: string
  instruction: string
  highlightComponent: string
}

export interface TechnicianPerformanceData {
  firstTimeFixRate: number
  reworkPercent: number
  customerRating: number
  workshopAverage: number
  trends: Array<{ period: string; score: number; label: string }>
  goals: Array<{ name: string; target: number; current: number; unit: string }>
}

export interface TechnicianEarningsData {
  byPeriod: Array<{ period: string; label: string; base: number; incentive: number; total: number }>
  byJobType: Array<{ jobType: string; labourUnits: number; amount: number; count: number }>
  payouts: Array<{ date: string; amount: number; status: string; method: string }>
  nextPayDate: string
  pendingAmount: number
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
  zones?: Array<{ id: string; name: string; slots: number; occupied: number }>
}

export interface PropertySlotItem {
  id: string
  type: 'parking' | 'ev'
  zoneId: string
  status: string
  reservedUntil: string | null
  powerKw?: number
}

export interface PropertySlotsData {
  slots: PropertySlotItem[]
  total: number
}

export interface PropertyDynamicPricingData {
  parkingRates: Array<{ zoneId: string; basePerHour: number; peakMultiplier: number; peakHours: string }>
  evRates: Array<{ ratePerKwh: number; offPeakPerKwh: number; offPeakHours: string }>
  overrides: Array<{ id: string; zoneId: string; reason: string; multiplier: number; validFrom: string; validTo: string }>
}

export interface PropertyEvChargingData {
  stations: Array<{ id: string; name: string; connectors: number; available: number; inUse: number; powerKw: number; status: string }>
  totalSessionsToday: number
  totalKwhToday: number
}

export interface PropertyLoadBalancingData {
  totalDrawKw: number
  capacityKw: number
  utilizationPercent: number
  byStation: Array<{ stationId: string; drawKw: number; capacityKw: number; status: string }>
  alerts: unknown[]
}

export interface PropertyRevenueAnalyticsData {
  bySource: Array<{ source: string; amount: number; percent: number; period: string }>
  byPeriod: Array<{ period: string; parking: number; ev: number }>
  currency: string
}

export interface PropertyPeakTrafficData {
  forecast: Array<{ hour: string; occupancyPercent: number; chargingDemandKw: number }>
  peakWindows: Array<{ start: string; end: string; label: string; suggestedMultiplier: number }>
}

export interface PropertyAccessControlData {
  rules: Array<{ id: string; name: string; type: string; access: string[]; active: boolean }>
  allowlist: Array<{ id: string; label: string; count: number }>
  blocklist: Array<{ id: string; label: string; count: number }>
  recentLog: Array<{ at: string; action: string; gateId: string; vehicleId: string }>
}

export interface PropertyCarbonImpactData {
  kwhDeliveredToday: number
  kwhDeliveredMonth: number
  co2AvoidedKgMonth: number
  equivalentIceKm: number
  trend: Array<{ month: string; kwh: number; co2Kg: number }>
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
  notes?: string
}

export interface DealerVehicleSaveResult {
  dataSource?: 'live' | 'fallback'
  success: boolean
  vehicle: DealerInventoryItem | null
  lastUpdated?: string
}

export interface DealerLeadItem {
  id: string
  name: string
  email: string
  phone: string
  source: string
  status: string
  score: number
  createdAt: string
}

export interface DealerLeadsData {
  dataSource?: 'live' | 'fallback'
  leads: DealerLeadItem[]
  lastUpdated?: string
}

export interface DealerSuggestedPriceItem {
  vehicleId: string
  make: string
  model: string
  currentPrice: number
  suggestedPrice: number
  margin: number
  reason: string
}

export interface DealerDynamicPricingData {
  dataSource?: 'live' | 'fallback'
  suggestedPrices: DealerSuggestedPriceItem[]
  rules: Array<{ id: string; name: string; value: string }>
  lastUpdated?: string
}

export interface DealerDemandForecastData {
  dataSource?: 'live' | 'fallback'
  bySegment: Array<{ segment: string; demand: number; stock: number; gap: number }>
  byMonth: Array<{ month: string; demand: number; trend: string }>
  lastUpdated?: string
}

export interface DealerSalesFunnelData {
  dataSource?: 'live' | 'fallback'
  stages: Array<{ stage: string; count: number; conversion: number }>
  summary: { totalLeads: number; winRate: number }
  lastUpdated?: string
}

export interface DealerSalesAnalyticsData {
  dataSource?: 'live' | 'fallback'
  totalRevenue: number
  unitsSold: number
  avgDealSize: number
  byMonth: Array<{ month: string; revenue: number; units: number }>
  lastUpdated?: string
}

export interface DealerCommissionData {
  dataSource?: 'live' | 'fallback'
  totalEarned: number
  pending: number
  byStaff: Array<{ staffId: string; name: string; earned: number; pending: number; deals: number }>
  lastUpdated?: string
}

export interface DealerMarketTrendsData {
  dataSource?: 'live' | 'fallback'
  insights: Array<{ id: string; title: string; segment: string; trend: string; impact: string }>
  priceIndex: Record<string, number>
  lastUpdated?: string
}

export interface DealerTradeInValuationItem {
  id: string
  make: string
  model: string
  year: number
  mileage: number
  condition: string
  rangeLow: number
  rangeHigh: number
  certifiedOffer: number
}

export interface DealerTradeInValuationsData {
  dataSource?: 'live' | 'fallback'
  valuations: DealerTradeInValuationItem[]
  lastUpdated?: string
}

export interface DealerCustomerItem {
  id: string
  name: string
  email: string
  vehiclesOwned: number
  lastVisit: string
  lifetimeValue: number
}

export interface DealerCustomersData {
  dataSource?: 'live' | 'fallback'
  customers: DealerCustomerItem[]
  lastUpdated?: string
}

export interface DealerFinanceIntegrationData {
  dataSource?: 'live' | 'fallback'
  lenders: Array<{ id: string; name: string; status: string; approvalRate: number }>
  summary: { applicationsThisMonth: number; approved: number; avgApr: number }
  lastUpdated?: string
}

// Sales dashboard APIs
export interface SalesDashboardData {
  dataSource?: 'live' | 'fallback'
  myLeads: number
  hotProspects: number
  followUpsDue: number
  pipelineValue: number
  dealsInProgress: number
  monthlyTarget: number
  monthlyAchieved: number
  targetPercent: number
  commissionEarned: number
  commissionPending: number
  lastUpdated?: string
}

export interface SalesLeadAssignmentItem {
  id: string
  name: string
  email: string
  source: string
  score: number
  status: string
  assignedTo?: string
  createdAt: string
}

export interface SalesLeadAssignmentData {
  dataSource?: 'live' | 'fallback'
  leadQueue: SalesLeadAssignmentItem[]
  scoringRules: Array<{ id: string; name: string; weight: number }>
  assignmentMode: string
  lastUpdated?: string
}

export interface SalesInteractionItem {
  id: string
  leadId: string
  type: string
  summary: string
  at: string
  rep: string
}

export interface SalesCustomerInteractionsData {
  dataSource?: 'live' | 'fallback'
  activities: SalesInteractionItem[]
  notesByLead: Record<string, string>
  lastUpdated?: string
}

export interface SalesPerformanceMetricsData {
  dataSource?: 'live' | 'fallback'
  conversionRates: { leadToQualified: number; qualifiedToProposal: number; proposalToWon: number }
  activity: { callsThisWeek: number; meetings: number; testDrives: number; proposalsSent: number }
  rankings: Array<{ rank: number; name: string; volume: number; revenue: number; targetPercent: number }>
  lastUpdated?: string
}

export interface SalesCommissionData {
  dataSource?: 'live' | 'fallback'
  earned: number
  pending: number
  payoutHistory: Array<{ id: string; period: string; amount: number; paidAt: string }>
  byDeal: Array<{ dealId: string; vehicle: string; amount: number; status: string }>
  lastUpdated?: string
}

export interface SalesAISuggestionsData {
  dataSource?: 'live' | 'fallback'
  nextBestAction: { leadId: string; action: string; reason: string; priority: string }
  talkingPoints: Array<{ leadId: string; points: string[] }>
  vehicleRecommendations: Array<{ leadId: string; vehicles: string[]; matchReason: string }>
  lastUpdated?: string
}

export interface SalesFollowUpItem {
  id: string
  leadId: string
  type: string
  due: string
  leadName: string
}

export interface SalesFollowUpData {
  dataSource?: 'live' | 'fallback'
  upcoming: SalesFollowUpItem[]
  overdue: SalesFollowUpItem[]
  lastUpdated?: string
}

export interface SalesTargetAchievementData {
  dataSource?: 'live' | 'fallback'
  targetUnits: number
  achievedUnits: number
  targetRevenue: number
  achievedRevenue: number
  daysLeftInPeriod: number
  progressPercent: number
  gapUnits: number
  gapRevenue: number
  forecastAtRunRate: number
  lastUpdated?: string
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
    const msg = obj?.error ?? obj?.message ?? text
    if (status === 404 && (msg === 'Not found' || String(msg).toLowerCase().includes('not found'))) {
      return 'Technician API not available. Start the backend: in autosphere_full_production_monorepo/services/backend run "npm start", then ensure the dev server proxy targets http://localhost:3000.'
    }
    return msg || `Request failed (${status})`
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
  createFleetMaintenance: (body: {
    vehiclePlate: string
    type?: string
    date?: string
    description?: string
    status?: string
    cost?: number | null
    recordedBy?: string
  }) =>
    fetch(`${API_BASE}/api/fleet/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText)
        throw new Error(parseErrorResponse(text, res.status))
      }
      return res.json() as Promise<FleetMaintenanceItem>
    }),
  getFleetReports: () => get<FleetReportItem[]>('/api/fleet/reports'),
  getFleetOrganizations: () => get<FleetOrganizationItem[]>('/api/fleet/organizations'),
  getFleetRoles: () => get<FleetRoleItem[]>('/api/fleet/roles'),
  getFleetPermissionsMatrix: () => get<FleetPermissionsMatrix>('/api/fleet/permissions-matrix'),
  getFleetUsers: () => get<FleetUserItem[]>('/api/fleet/users'),
  getFleetTrips: (limit = 50) => get<FleetTripItem[]>(`/api/fleet/trips?limit=${limit}`),
  getFleetTripsAssigned: (driverId: string, limit = 50) =>
    get<FleetTripItem[]>(`/api/fleet/trips/assigned?driverId=${encodeURIComponent(driverId)}&limit=${limit}`),
  bookFleetTrip: (body: { passengerId?: string; startLocation?: string; endLocation?: string; date?: string }) =>
    fetch(`${API_BASE}/api/fleet/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText)
        throw new Error(parseErrorResponse(text, res.status))
      }
      return res.json() as Promise<FleetTripItem>
    }),
  updateFleetTripStatus: (tripId: string, status: FleetTripItem['status']) =>
    fetch(`${API_BASE}/api/fleet/trips/${tripId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText)
        throw new Error(parseErrorResponse(text, res.status))
      }
      return res.json() as Promise<FleetTripItem>
    }),
  assignFleetTrip: (tripId: string, body: { driverId?: string; vehicleId?: string }) =>
    fetch(`${API_BASE}/api/fleet/trips/${tripId}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText)
        throw new Error(parseErrorResponse(text, res.status))
      }
      return res.json() as Promise<FleetTripItem>
    }),
  respondFleetTrip: (tripId: string, body: { driverId: string; action: 'accept' | 'reject' }) =>
    fetch(`${API_BASE}/api/fleet/trips/${tripId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText)
        throw new Error(parseErrorResponse(text, res.status))
      }
      return res.json() as Promise<FleetTripItem>
    }),
  getFleetTripsPassenger: (passengerId: string, limit = 50) =>
    get<FleetTripItem[]>(
      `/api/fleet/trips/passenger?passengerId=${encodeURIComponent(passengerId)}&limit=${limit}`
    ),
  getFleetPassengerBilling: (passengerId?: string) =>
    get<FleetPassengerBillingData>(
      `/api/fleet/billing/passenger${passengerId ? `?passengerId=${encodeURIComponent(passengerId)}` : ''}`
    ),
  getFleetVehiclesPublic: () => get<FleetPublicVehiclesResponse>('/api/fleet/vehicles/public'),
  getFleetActivityLog: (limit = 80) => get<FleetActivityLogItem[]>(`/api/fleet/activity-log?limit=${limit}`),
  getFleetSettings: () => get<FleetSystemSettingsData>('/api/fleet/settings'),
  getFleetFuelLogs: (limit = 80) => get<FleetFuelLogItem[]>(`/api/fleet/fuel?limit=${limit}`),
  addFleetFuelLog: (body: {
    vehiclePlate: string
    date?: string
    liters: number
    pricePerLiter?: number
    totalCost?: number
    odometerKm?: number
    fuelType?: string
    station?: string
    recordedBy?: string
  }) =>
    fetch(`${API_BASE}/api/fleet/fuel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText)
        throw new Error(parseErrorResponse(text, res.status))
      }
      return res.json() as Promise<FleetFuelLogItem>
    }),
  getFleetAlerts: (status: 'open' | 'resolved' | 'all' = 'all', limit = 80) =>
    get<FleetAlertItem[]>(`/api/fleet/alerts?status=${encodeURIComponent(status)}&limit=${limit}`),
  updateFleetAlertStatus: (alertId: string, status: 'open' | 'resolved', actorUserId?: string) =>
    fetch(`${API_BASE}/api/fleet/alerts/${encodeURIComponent(alertId)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...(actorUserId ? { actorUserId } : {}) }),
    }).then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText)
        throw new Error(parseErrorResponse(text, res.status))
      }
      return res.json() as Promise<FleetAlertItem & { updated?: boolean }>
    }),
  saveFleetSettings: (body: Partial<FleetSystemSettingsData>) =>
    fetch(`${API_BASE}/api/fleet/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText)
        throw new Error(parseErrorResponse(text, res.status))
      }
      return res.json() as Promise<FleetSystemSettingsData>
    }),
  patchFleetUserRole: (userId: string, body: { roleSlug: string; actorUserId?: string }) =>
    fetch(`${API_BASE}/api/fleet/users/${encodeURIComponent(userId)}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText)
        throw new Error(parseErrorResponse(text, res.status))
      }
      return res.json() as Promise<FleetUserItem & { updated?: boolean }>
    }),

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
  getInsuranceRealTimeRisk: () => get<InsuranceRealTimeRiskData>('/api/insurance/real-time-risk'),
  getInsurancePolicies: () => get<InsurancePoliciesData>('/api/insurance/policies'),
  getInsuranceClaims: () => get<InsuranceClaimsData>('/api/insurance/claims'),
  getInsuranceDriversRisk: () => get<InsuranceDriversRiskData>('/api/insurance/drivers-risk'),
  getInsuranceDynamicPremium: () => get<InsuranceDynamicPremiumData>('/api/insurance/dynamic-premium'),
  getInsuranceFraudDetection: () => get<InsuranceFraudDetectionData>('/api/insurance/fraud-detection'),
  getInsuranceRiskHeatmaps: () => get<InsuranceRiskHeatmapsData>('/api/insurance/risk-heatmaps'),
  getInsurancePredictiveLossForecasting: () => get<InsurancePredictiveLossForecastingData>('/api/insurance/predictive-loss-forecasting'),
  getInsuranceModelPerformance: () => get<InsuranceModelPerformanceData>('/api/insurance/model-performance'),
  getInsuranceComplianceReporting: () => get<InsuranceComplianceReportingData>('/api/insurance/compliance-reporting'),
  getInsuranceApiIntegrationSettings: () => get<InsuranceApiIntegrationSettingsData>('/api/insurance/api-integration-settings'),
  getTechnicianJobs: () => get<TechnicianJobItem[]>('/api/technician/jobs'),
  getDiagnosticTwinList: () => get<VehicleDiagnosticTwinListItem[]>('/api/technician/diagnostic-twin/list'),
  getDiagnosticTwin: (params?: { vehicleId?: string; vin?: string; plate?: string }) => {
    if (!params || (!params.vehicleId && !params.vin && !params.plate))
      return get<VehicleDiagnosticTwinData>('/api/technician/diagnostic-twin')
    const q: Record<string, string> = {}
    if (params.vehicleId) q.vehicleId = params.vehicleId
    if (params.vin) q.vin = params.vin
    if (params.plate) q.plate = params.plate
    return getWithQuery<VehicleDiagnosticTwinData>('/api/technician/diagnostic-twin', q)
  },
  runDiagnosticScan: (params: { plateNumber?: string; vin?: string }) =>
    fetch(`${API_BASE}/api/technician/diagnostic-twin/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((data as { message?: string }).message || 'Scan failed')
      return data as { success: boolean; twin: VehicleDiagnosticTwinData; message: string }
    }),
  getTechnicianProfile: () => get<TechnicianProfileData>('/api/technician/profile'),
  getTechnicianAiFaults: (jobId?: string) =>
    jobId ? getWithQuery<TechnicianAiFaultsData>('/api/technician/ai-faults', { jobId }) : get<TechnicianAiFaultsData>('/api/technician/ai-faults'),
  getTechnicianRepairRecommendations: (jobId?: string) =>
    jobId ? getWithQuery<TechnicianRepairRecommendationsData>('/api/technician/repair-recommendations', { jobId }) : get<TechnicianRepairRecommendationsData>('/api/technician/repair-recommendations'),
  getTechnicianPartsPrediction: (jobId?: string) =>
    jobId ? getWithQuery<TechnicianPartsPredictionData>('/api/technician/parts-prediction', { jobId }) : get<TechnicianPartsPredictionData>('/api/technician/parts-prediction'),
  getTechnicianWorkflow: (jobId?: string) =>
    jobId ? getWithQuery<TechnicianWorkflowData>('/api/technician/workflow', { jobId }) : get<TechnicianWorkflowData>('/api/technician/workflow'),
  getTechnicianTimeEstimate: (jobId?: string) =>
    jobId ? getWithQuery<TechnicianTimeEstimateData>('/api/technician/time-estimate', { jobId }) : get<TechnicianTimeEstimateData>('/api/technician/time-estimate'),
  updateTechnicianTimeEstimate: (params: { jobId?: string; action: 'start' | 'update' | 'complete'; actualMinutes?: number }) =>
    fetch(`${API_BASE}/api/technician/time-estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((data as { error?: string }).error || 'Update failed')
      return data as TechnicianTimeEstimateData
    }),
  getTechnicianArSteps: (jobId?: string) =>
    jobId ? getWithQuery<{ steps: TechnicianArStep[] }>('/api/technician/ar-steps', { jobId }) : get<{ steps: TechnicianArStep[] }>('/api/technician/ar-steps'),
  getTechnicianPerformance: () => get<TechnicianPerformanceData>('/api/technician/performance'),
  getTechnicianEarnings: () => get<TechnicianEarningsData>('/api/technician/earnings'),
  getDriverTechnicianProfile: (driverId?: string) =>
    get<DriverTechnicianProfileData>('/api/driver/technician-profile', driverId),
  getDriverLiveRepair: (driverId?: string) =>
    get<DriverLiveRepairData>('/api/driver/live-repair', driverId),
  getPropertyParkingStats: () => get<PropertyParkingStatsData>('/api/property/parking-stats'),
  getPropertySlots: () => get<PropertySlotsData>('/api/property/slots'),
  getPropertyDynamicPricing: () => get<PropertyDynamicPricingData>('/api/property/dynamic-pricing'),
  getPropertyEvCharging: () => get<PropertyEvChargingData>('/api/property/ev-charging'),
  getPropertyLoadBalancing: () => get<PropertyLoadBalancingData>('/api/property/load-balancing'),
  getPropertyRevenueAnalytics: () => get<PropertyRevenueAnalyticsData>('/api/property/revenue-analytics'),
  getPropertyPeakTraffic: () => get<PropertyPeakTrafficData>('/api/property/peak-traffic'),
  getPropertyAccessControl: () => get<PropertyAccessControlData>('/api/property/access-control'),
  getPropertyCarbonImpact: () => get<PropertyCarbonImpactData>('/api/property/carbon-impact'),
  getGovernmentRecallsSummary: (make?: string, year?: number) =>
    getWithQuery<GovernmentRecallsSummaryData>('/api/government/recalls-summary', { make: make ?? 'Toyota', year: year ?? 2024 }),
  getDealerInventory: () => get<DealerInventoryItem[]>('/api/dealer/inventory'),
  getDealerLeads: () => get<DealerLeadsData>('/api/dealer/leads'),
  getDealerDynamicPricing: () => get<DealerDynamicPricingData>('/api/dealer/dynamic-pricing'),
  getDealerDemandForecast: () => get<DealerDemandForecastData>('/api/dealer/demand-forecast'),
  getDealerSalesFunnel: () => get<DealerSalesFunnelData>('/api/dealer/sales-funnel'),
  getDealerSalesAnalytics: () => get<DealerSalesAnalyticsData>('/api/dealer/sales-analytics'),
  getDealerCommission: () => get<DealerCommissionData>('/api/dealer/commission'),
  getDealerMarketTrends: () => get<DealerMarketTrendsData>('/api/dealer/market-trends'),
  getDealerTradeInValuations: () => get<DealerTradeInValuationsData>('/api/dealer/trade-in-valuations'),
  getDealerCustomers: () => get<DealerCustomersData>('/api/dealer/customers'),
  getDealerFinanceIntegration: () => get<DealerFinanceIntegrationData>('/api/dealer/finance-integration'),
  getSalesDashboard: () => get<SalesDashboardData>('/api/sales/dashboard'),
  getSalesLeadAssignment: () => get<SalesLeadAssignmentData>('/api/sales/lead-assignment'),
  getSalesCustomerInteractions: () => get<SalesCustomerInteractionsData>('/api/sales/customer-interactions'),
  getSalesPerformanceMetrics: () => get<SalesPerformanceMetricsData>('/api/sales/performance-metrics'),
  getSalesCommission: () => get<SalesCommissionData>('/api/sales/commission'),
  getSalesAISuggestions: () => get<SalesAISuggestionsData>('/api/sales/ai-suggestions'),
  getSalesFollowUp: () => get<SalesFollowUpData>('/api/sales/follow-up'),
  getSalesTargetAchievement: () => get<SalesTargetAchievementData>('/api/sales/target-achievement'),
  saveDealerVehicle: (payload: Partial<DealerInventoryItem> & { make: string; model: string; plateNumber: string }) =>
    fetch(`${API_BASE}/api/dealer/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}))
      if (!res.ok && (data as { success?: boolean }).success !== true) {
        throw new Error((data as { error?: string }).error || 'Save failed')
      }
      return data as DealerVehicleSaveResult
    }),
  getAnalyticsVehicleHealthTrends: () => get<AnalyticsTrendsData>('/api/analytics/vehicle-health-trends'),
  getAnalyticsInsuranceRiskTrends: () => get<AnalyticsTrendsData>('/api/analytics/insurance-risk-trends'),
}
