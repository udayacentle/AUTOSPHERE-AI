export interface SalesScreen {
  id: number
  path: string
  title: string
}

export const SALES_SCREENS: SalesScreen[] = [
  { id: 1, path: 'sales-dashboard', title: 'Sales Dashboard' },
  { id: 2, path: 'lead-assignment-scoring', title: 'Lead Assignment & Scoring' },
  { id: 3, path: 'customer-interaction-logs', title: 'Customer Interaction Logs' },
  { id: 4, path: 'performance-metrics', title: 'Performance Metrics' },
  { id: 5, path: 'commission-tracker', title: 'Commission Tracker' },
  { id: 6, path: 'ai-sales-suggestions', title: 'AI Sales Suggestions' },
  { id: 7, path: 'follow-up-scheduler', title: 'Follow-Up Scheduler' },
  { id: 8, path: 'target-achievement-tracker', title: 'Target Achievement Tracker' },
]
