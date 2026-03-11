export interface AIAdminScreen {
  id: number
  path: string
  title: string
}

export const AI_ADMIN_SCREENS: AIAdminScreen[] = [
  { id: 1, path: 'super-admin-dashboard', title: 'Super Admin Dashboard' },
  { id: 2, path: 'user-role-management', title: 'User & Role Management' },
  { id: 3, path: 'ai-model-monitoring', title: 'AI Model Monitoring' },
  { id: 4, path: 'model-accuracy-dashboard', title: 'Model Accuracy Dashboard' },
  { id: 5, path: 'federated-learning-monitor', title: 'Federated Learning Monitor' },
  { id: 6, path: 'data-flow-visualization', title: 'Data Flow Visualization' },
  { id: 7, path: 'api-gateway-monitor', title: 'API Gateway Monitor' },
  { id: 8, path: 'system-health-dashboard', title: 'System Health Dashboard' },
  { id: 9, path: 'incident-management', title: 'Incident Management' },
  { id: 10, path: 'audit-logs', title: 'Audit Logs' },
  { id: 11, path: 'security-control-center', title: 'Security Control Center' },
  { id: 12, path: 'billing-subscription-management', title: 'Billing & Subscription Management' },
]
