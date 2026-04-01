export interface FleetScreen {
  id: number
  path: string
  title: string
}

export const FLEET_SCREENS: FleetScreen[] = [
  { id: 1, path: 'dashboard', title: 'Fleet Dashboard' },
  { id: 2, path: 'organizations', title: 'Admin Organizations' },
  { id: 3, path: 'roles', title: 'Roles' },
  { id: 4, path: 'trips', title: 'Trips' },
  { id: 5, path: 'users', title: 'Users' },
  { id: 6, path: 'vehicles', title: 'Vehicles' },
  { id: 7, path: 'tracking', title: 'Live Tracking' },
  { id: 8, path: 'drivers', title: 'Drivers & Assignments' },
  { id: 9, path: 'fuel-management', title: 'Fuel Management' },
  { id: 10, path: 'alerts', title: 'Alerts & Notifications' },
  { id: 11, path: 'maintenance', title: 'Maintenance & Service' },
  { id: 12, path: 'reports', title: 'Reports & Analytics' },
  { id: 13, path: 'permissions-matrix', title: 'Permissions Matrix' },
  { id: 14, path: 'driver-console', title: 'Driver — Assigned trips' },
  { id: 15, path: 'passenger-portal', title: 'Passenger — Book & track' },
  { id: 16, path: 'passenger-billing', title: 'Passenger — Billing' },
  { id: 17, path: 'guest-fleet', title: 'Guest — Public fleet' },
  { id: 18, path: 'activity-log', title: 'Activity & audit log' },
  { id: 19, path: 'system-settings', title: 'System settings (Super Admin)' },
]
