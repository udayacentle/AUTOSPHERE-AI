import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import {
  type FleetDemoRole,
  getStoredFleetRole,
  setStoredFleetRole,
  isFleetSystemSettingsFull,
  isPassengerVehicleView,
  fleetRoleLabel,
} from '../config/fleetRoleAccess'

type Ctx = {
  role: FleetDemoRole
  setRole: (r: FleetDemoRole) => void
  systemSettingsFull: boolean
  passengerVehicleReadOnly: boolean
  roleLabel: string
}

const FleetRoleContext = createContext<Ctx | null>(null)

export function FleetRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<FleetDemoRole>(getStoredFleetRole)

  useEffect(() => {
    const onChange = () => setRoleState(getStoredFleetRole())
    window.addEventListener('fleet-demo-role-change', onChange)
    return () => window.removeEventListener('fleet-demo-role-change', onChange)
  }, [])

  const setRole = useCallback((r: FleetDemoRole) => {
    setStoredFleetRole(r)
    setRoleState(r)
  }, [])

  const value: Ctx = {
    role,
    setRole,
    systemSettingsFull: isFleetSystemSettingsFull(role),
    passengerVehicleReadOnly: isPassengerVehicleView(role),
    roleLabel: fleetRoleLabel(role),
  }

  return <FleetRoleContext.Provider value={value}>{children}</FleetRoleContext.Provider>
}

export function useFleetRole() {
  const c = useContext(FleetRoleContext)
  if (!c) {
    return {
      role: getStoredFleetRole(),
      setRole: setStoredFleetRole,
      systemSettingsFull: isFleetSystemSettingsFull(getStoredFleetRole()),
      passengerVehicleReadOnly: isPassengerVehicleView(getStoredFleetRole()),
      roleLabel: fleetRoleLabel(getStoredFleetRole()),
    }
  }
  return c
}
