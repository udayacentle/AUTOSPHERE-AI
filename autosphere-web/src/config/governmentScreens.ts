export interface GovernmentScreen {
  id: number
  path: string
  title: string
}

export const GOVERNMENT_SCREENS: GovernmentScreen[] = [
  { id: 1, path: 'regulator-login', title: 'Regulator Login' },
  { id: 2, path: 'national-vehicle-overview', title: 'National Vehicle Overview' },
  { id: 3, path: 'compliance-monitoring-dashboard', title: 'Compliance Monitoring Dashboard' },
  { id: 4, path: 'emission-monitoring-panel', title: 'Emission Monitoring Panel' },
  { id: 5, path: 'traffic-density-heatmap', title: 'Traffic Density Heatmap' },
  { id: 6, path: 'accident-cluster-prediction', title: 'Accident Cluster Prediction' },
  { id: 7, path: 'risk-zone-analytics', title: 'Risk Zone Analytics' },
  { id: 8, path: 'policy-simulation-engine', title: 'Policy Simulation Engine' },
  { id: 9, path: 'recall-monitoring', title: 'Recall Monitoring' },
  { id: 10, path: 'fraud-pattern-analytics', title: 'Fraud Pattern Analytics' },
  { id: 11, path: 'regional-reports', title: 'Regional Reports' },
  { id: 12, path: 'export-reporting-tools', title: 'Export & Reporting Tools' },
]
