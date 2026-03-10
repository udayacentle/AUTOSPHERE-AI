export interface InsuranceScreen {
  id: number
  path: string
  title: string
}

export const INSURANCE_SCREENS: InsuranceScreen[] = [
  { id: 1, path: 'insurance-admin-login', title: 'Insurance Admin Login' },
  { id: 2, path: 'portfolio-overview-dashboard', title: 'Portfolio Overview Dashboard' },
  { id: 3, path: 'real-time-risk-monitor', title: 'Real-Time Risk Monitor' },
  { id: 4, path: 'driver-risk-profile-view', title: 'Driver Risk Profile View' },
  { id: 5, path: 'dynamic-premium-adjustment-panel', title: 'Dynamic Premium Adjustment Panel' },
  { id: 6, path: 'claims-management-dashboard', title: 'Claims Management Dashboard' },
  { id: 7, path: 'ai-fraud-detection-graph-view', title: 'AI Fraud Detection Graph View' },
  { id: 8, path: 'risk-heatmaps', title: 'Risk Heatmaps' },
  { id: 9, path: 'policy-management', title: 'Policy Management' },
  { id: 10, path: 'predictive-loss-forecasting', title: 'Predictive Loss Forecasting' },
  { id: 11, path: 'model-performance-monitoring', title: 'Model Performance Monitoring' },
  { id: 12, path: 'compliance-reporting', title: 'Compliance Reporting' },
  { id: 13, path: 'api-integration-settings', title: 'API Integration Settings' },
]
