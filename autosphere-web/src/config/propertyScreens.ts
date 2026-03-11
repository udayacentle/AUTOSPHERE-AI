export interface PropertyScreen {
  id: number
  path: string
  title: string
}

export const PROPERTY_SCREENS: PropertyScreen[] = [
  { id: 1, path: 'property-admin-login', title: 'Property Admin Login' },
  { id: 2, path: 'property-dashboard', title: 'Property Dashboard' },
  { id: 3, path: 'parking-utilization-heatmap', title: 'Parking Utilization Heatmap' },
  { id: 4, path: 'slot-management', title: 'Slot Management' },
  { id: 5, path: 'dynamic-pricing-engine', title: 'Dynamic Pricing Engine' },
  { id: 6, path: 'ev-charging-control-panel', title: 'EV Charging Control Panel' },
  { id: 7, path: 'load-balancing-monitor', title: 'Load Balancing Monitor' },
  { id: 8, path: 'revenue-analytics-dashboard', title: 'Revenue Analytics Dashboard' },
  { id: 9, path: 'peak-traffic-prediction', title: 'Peak Traffic Prediction' },
  { id: 10, path: 'access-control-management', title: 'Access Control Management' },
  { id: 11, path: 'carbon-impact-dashboard', title: 'Carbon Impact Dashboard' },
]
