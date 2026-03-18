import type {
  TechnicianJobItem,
  TechnicianAiFaultsData,
  TechnicianRepairRecommendationsData,
  TechnicianPartsPredictionData,
  TechnicianWorkflowData,
  TechnicianTimeEstimateData,
  TechnicianArStep,
  TechnicianPerformanceData,
  TechnicianEarningsData,
} from '../../../api/client'

export const FALLBACK_JOBS: TechnicianJobItem[] = [
  { id: 'job-1', vehiclePlate: 'AB-1234', type: 'Oil Change', status: 'in_progress', priority: 'medium', estimatedMinutes: 45, date: '2025-03-15', description: 'Regular oil and filter change' },
  { id: 'job-2', vehiclePlate: 'CD-5678', type: 'Tire Rotation', status: 'pending', priority: 'low', estimatedMinutes: 30, date: '2025-03-20', description: 'Rotate tires and balance' },
  { id: 'job-3', vehiclePlate: 'EF-9012', type: 'Brake Inspection', status: 'pending', priority: 'high', estimatedMinutes: 60, date: '2025-03-25', description: 'Full brake pad and rotor check' },
]

export const FALLBACK_AI_FAULTS: TechnicianAiFaultsData = {
  faults: [
    { fault: 'Catalyst efficiency below threshold', cause: 'Aging O2 sensor or exhaust leak', confidence: 0.88, evidence: 'P0420, O2 readings' },
    { fault: 'System too lean', cause: 'Vacuum leak or MAF', confidence: 0.72, evidence: 'P0171, fuel trim' },
  ],
  rootCause: { primary: 'O2 sensor Bank 1', contributing: ['Possible exhaust leak', 'MAF may need cleaning'] },
  similarCases: [
    { caseId: 'C-2024-112', vehiclePlate: 'XY-9999', summary: 'P0420 on Camry', outcome: 'Replaced O2 sensor' },
    { caseId: 'C-2024-089', vehiclePlate: 'AB-1111', summary: 'P0171 lean', outcome: 'Cleaned MAF, replaced intake gasket' },
  ],
}

export const FALLBACK_REPAIR_RECS: TechnicianRepairRecommendationsData = {
  steps: [
    { order: 1, name: 'Inspect', description: 'Check O2 sensor and exhaust for leaks', durationMin: 15 },
    { order: 2, name: 'Replace/Repair', description: 'Replace O2 sensor or repair leak', durationMin: 45 },
    { order: 3, name: 'Test', description: 'Clear codes, test drive, verify', durationMin: 20 },
  ],
  parts: [
    { partNumber: '89465-0D210', name: 'O2 Sensor Bank 1', quantity: 1, inStock: true, unitPrice: 89 },
    { partNumber: '17801-0Y060', name: 'Air filter', quantity: 1, inStock: true, unitPrice: 24 },
  ],
  labourMinutes: 80,
  manualLinks: [
    { title: 'O2 sensor replacement - Toyota TS', url: '/manuals/toyota-o2-replace' },
    { title: 'P0420 diagnostic tree', url: '/manuals/p0420' },
  ],
}

export const FALLBACK_PARTS: TechnicianPartsPredictionData = {
  predicted: [
    { partNumber: '89465-0D210', name: 'O2 Sensor Bank 1', quantity: 1, inStock: true, unitPrice: 89 },
    { partNumber: '17801-0Y060', name: 'Air filter', quantity: 1, inStock: true, unitPrice: 24 },
  ],
  stock: [
    { partNumber: '89465-0D210', name: 'O2 Sensor Bank 1', quantity: 4, location: 'Aisle 12' },
    { partNumber: '17801-0Y060', name: 'Air filter', quantity: 12, location: 'Aisle 5' },
  ],
  alternatives: [
    { partNumber: 'OX-234', name: 'O2 Sensor (aftermarket)', oemPartNumber: '89465-0D210', aftermarket: true },
  ],
}

export const FALLBACK_WORKFLOW: TechnicianWorkflowData = {
  stages: [
    { id: 'diagnose', name: 'Diagnose', status: 'done', estimatedMin: 15, actualMin: 12, startedAt: null, completedAt: null },
    { id: 'parts', name: 'Parts', status: 'done', estimatedMin: 10, actualMin: 8, startedAt: null, completedAt: null },
    { id: 'repair', name: 'Repair', status: 'active', estimatedMin: 45, actualMin: null, startedAt: null, completedAt: null },
    { id: 'test', name: 'Test', status: 'pending', estimatedMin: 20, actualMin: null, startedAt: null, completedAt: null },
    { id: 'complete', name: 'Complete', status: 'pending', estimatedMin: 5, actualMin: null, startedAt: null, completedAt: null },
  ],
}

export const FALLBACK_TIME_ESTIMATE: TechnicianTimeEstimateData = {
  estimatedMinutes: 80,
  actualMinutes: 20,
  eta: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  startedAt: new Date().toISOString(),
}

export const FALLBACK_AR_STEPS: TechnicianArStep[] = [
  { order: 1, title: 'Locate O2 sensor', instruction: 'Point camera at exhaust manifold. Sensor is before catalytic converter.', highlightComponent: 'O2_Bank1' },
  { order: 2, title: 'Disconnect', instruction: 'Unplug electrical connector. Remove sensor with 22mm wrench.', highlightComponent: 'O2_connector' },
  { order: 3, title: 'Install', instruction: 'Apply anti-seize to threads. Torque to 35 Nm.', highlightComponent: 'O2_Bank1' },
]

export const FALLBACK_PERFORMANCE: TechnicianPerformanceData = {
  firstTimeFixRate: 94,
  reworkPercent: 3,
  customerRating: 4.8,
  workshopAverage: 4.2,
  trends: [
    { period: 'Jan 2025', score: 92, label: 'First-time fix' },
    { period: 'Feb 2025', score: 93, label: 'First-time fix' },
    { period: 'Mar 2025', score: 94, label: 'First-time fix' },
  ],
  goals: [
    { name: 'First-time fix rate', target: 95, current: 94, unit: '%' },
    { name: 'Rework', target: 2, current: 3, unit: '%' },
    { name: 'Customer rating', target: 4.8, current: 4.8, unit: '/5' },
  ],
}

export const FALLBACK_EARNINGS: TechnicianEarningsData = {
  byPeriod: [
    { period: 'today', label: 'Today', base: 120, incentive: 20, total: 140 },
    { period: 'week', label: 'This week', base: 680, incentive: 95, total: 775 },
    { period: 'month', label: 'This month', base: 2840, incentive: 420, total: 3260 },
  ],
  byJobType: [
    { jobType: 'Oil Change', labourUnits: 0.5, amount: 42, count: 12 },
    { jobType: 'Brake Service', labourUnits: 2, amount: 280, count: 3 },
    { jobType: 'Diagnostics', labourUnits: 1, amount: 95, count: 5 },
  ],
  payouts: [
    { date: '2025-03-01', amount: 3180, status: 'paid', method: 'Direct deposit' },
    { date: '2025-02-28', amount: 3020, status: 'paid', method: 'Direct deposit' },
  ],
  nextPayDate: '2025-03-31',
  pendingAmount: 775,
}
