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
]
