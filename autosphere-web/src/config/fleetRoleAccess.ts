import { FLEET_SCREENS, type FleetScreen } from './fleetScreens'

/** Demo role selector (production: JWT / session) */
export type FleetDemoRole = 'guest' | 'driver' | 'passenger' | 'entity_admin' | 'super_admin'

export const FLEET_DEMO_ROLE_KEY = 'autosphere-fleet-demo-role'
export const FLEET_ROLE_DEFAULT: FleetDemoRole = 'entity_admin'

const ALL_PATHS = FLEET_SCREENS.map((s) => s.path)

/**
 * Paths each role may open.
 * Guest: public only. Driver: trips + tracking. Passenger: portal, billing, vehicles (read-only). Admins: full.
 */
const PATHS_BY_ROLE: Record<FleetDemoRole, Set<string>> = {
  guest: new Set(['guest-fleet']),
  driver: new Set(['driver-console', 'tracking']),
  passenger: new Set(['passenger-portal', 'passenger-billing', 'tracking', 'vehicles']),
  entity_admin: new Set(ALL_PATHS),
  super_admin: new Set(ALL_PATHS),
}

export const FLEET_ROLE_HOME: Record<FleetDemoRole, string> = {
  guest: 'guest-fleet',
  driver: 'driver-console',
  passenger: 'passenger-portal',
  entity_admin: 'dashboard',
  super_admin: 'dashboard',
}

export function getStoredFleetRole(): FleetDemoRole {
  try {
    const r = localStorage.getItem(FLEET_DEMO_ROLE_KEY) as FleetDemoRole | null
    if (r && r in PATHS_BY_ROLE) return r
  } catch {
    /* ignore */
  }
  return FLEET_ROLE_DEFAULT
}

export function setStoredFleetRole(role: FleetDemoRole) {
  try {
    localStorage.setItem(FLEET_DEMO_ROLE_KEY, role)
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event('fleet-demo-role-change'))
}

export function isFleetPathAllowed(role: FleetDemoRole, pathSegment: string): boolean {
  if (!pathSegment || pathSegment === 'fleet') return true
  return PATHS_BY_ROLE[role].has(pathSegment)
}

export function getFleetScreensForRole(role: FleetDemoRole): FleetScreen[] {
  const allow = PATHS_BY_ROLE[role]
  return FLEET_SCREENS.filter((s) => allow.has(s.path)).map((s, i) => ({ ...s, id: i + 1 }))
}

export function fleetRoleLabel(role: FleetDemoRole): string {
  const labels: Record<FleetDemoRole, string> = {
    guest: 'Guest User',
    driver: 'Driver',
    passenger: 'Passenger',
    entity_admin: 'Entity Admin',
    super_admin: 'Super Admin',
  }
  return labels[role]
}

/** Entity admin: limited system settings vs Super Admin: full */
export function isFleetSystemSettingsFull(role: FleetDemoRole): boolean {
  return role === 'super_admin'
}

export function isPassengerVehicleView(role: FleetDemoRole): boolean {
  return role === 'passenger'
}
