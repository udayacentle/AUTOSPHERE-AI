export interface TechnicianScreen {
  id: number
  path: string
  title: string
}

export const TECHNICIAN_SCREENS: TechnicianScreen[] = [
  { id: 1, path: 'technician-login', title: 'Technician Login' },
  { id: 2, path: 'job-queue-dashboard', title: 'Job Queue Dashboard' },
  { id: 3, path: 'vehicle-diagnostic-digital-twin', title: 'Vehicle Diagnostic Digital Twin' },
  { id: 4, path: 'ai-fault-detection', title: 'AI Fault Detection' },
  { id: 5, path: 'repair-recommendations', title: 'Repair Recommendations' },
  { id: 6, path: 'parts-prediction-engine', title: 'Parts Prediction Engine' },
  { id: 7, path: 'repair-workflow-tracker', title: 'Repair Workflow Tracker' },
  { id: 8, path: 'ar-assistance-view', title: 'AR Assistance View' },
  { id: 9, path: 'repair-time-estimator', title: 'Repair Time Estimator' },
  { id: 10, path: 'technician-performance-score', title: 'Technician Performance Score' },
  { id: 11, path: 'earnings-summary', title: 'Earnings Summary' },
]
