export interface AnalyticsScreen {
  id: number
  path: string
  title: string
}

export const ANALYTICS_SCREENS: AnalyticsScreen[] = [
  { id: 1, path: 'global-performance-dashboard', title: 'Global Performance Dashboard' },
  { id: 2, path: 'mobility-score-distribution', title: 'Mobility Score Distribution' },
  { id: 3, path: 'vehicle-health-trends', title: 'Vehicle Health Trends' },
  { id: 4, path: 'insurance-risk-trends', title: 'Insurance Risk Trends' },
  { id: 5, path: 'dealer-sales-trends', title: 'Dealer Sales Trends' },
  { id: 6, path: 'technician-performance-trends', title: 'Technician Performance Trends' },
  { id: 7, path: 'parking-revenue-trends', title: 'Parking Revenue Trends' },
  { id: 8, path: 'emission-analytics', title: 'Emission Analytics' },
  { id: 9, path: 'predictive-forecast-charts', title: 'Predictive Forecast Charts' },
  { id: 10, path: 'ai-model-comparison-dashboard', title: 'AI Model Comparison Dashboard' },
]
