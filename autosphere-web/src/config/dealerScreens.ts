export interface DealerScreen {
  id: number
  path: string
  title: string
}

export const DEALER_SCREENS: DealerScreen[] = [
  { id: 1, path: 'dealer-login-dashboard', title: 'Dealer Login & Dashboard' },
  { id: 2, path: 'inventory-management', title: 'Inventory Management' },
  { id: 3, path: 'add-edit-vehicle', title: 'Add/Edit Vehicle' },
  { id: 4, path: 'digital-twin-inventory-view', title: 'Digital Twin Inventory View' },
  { id: 5, path: 'dynamic-pricing-engine', title: 'Dynamic Pricing Engine' },
  { id: 6, path: 'demand-forecast-dashboard', title: 'Demand Forecast Dashboard' },
  { id: 7, path: 'trade-in-valuation-tool', title: 'Trade-In Valuation Tool' },
  { id: 8, path: 'lead-management', title: 'Lead Management' },
  { id: 9, path: 'customer-profile-view', title: 'Customer Profile View' },
  { id: 10, path: 'sales-funnel', title: 'Sales Funnel' },
  { id: 11, path: 'sales-analytics', title: 'Sales Analytics' },
  { id: 12, path: 'commission-management', title: 'Commission Management' },
  { id: 13, path: 'finance-integration-panel', title: 'Finance Integration Panel' },
  { id: 14, path: 'market-trend-insights', title: 'Market Trend Insights' },
]
