export interface FleetScreen {
  id: number
  path: string
  title: string
}

export const FLEET_SCREENS: FleetScreen[] = [
  { id: 1, path: 'dashboard', title: 'Fleet Dashboard' },
  { id: 2, path: 'vehicles', title: 'Vehicles' },
  { id: 3, path: 'tracking', title: 'Live Tracking' },
  { id: 4, path: 'drivers', title: 'Drivers & Assignments' },
  { id: 5, path: 'maintenance', title: 'Maintenance & Service' },
  { id: 6, path: 'reports', title: 'Reports & Analytics' },
  { id: 7, path: 'permissions-matrix', title: 'Permissions Matrix' },
  { id: 8, path: 'driver-console', title: 'Driver — Assigned trips' },
  { id: 9, path: 'passenger-portal', title: 'Passenger — Book & track' },
  { id: 10, path: 'passenger-billing', title: 'Passenger — Billing' },
  { id: 11, path: 'guest-fleet', title: 'Guest — Public fleet' },
  { id: 12, path: 'activity-log', title: 'Activity & audit log' },
  { id: 13, path: 'system-settings', title: 'System settings (Super Admin)' },
]
