import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, type FleetVehicleItem } from '../api/client'

interface FleetVehiclesContextValue {
  vehicles: FleetVehicleItem[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const FleetVehiclesContext = createContext<FleetVehiclesContextValue | null>(null)

export function FleetVehiclesProvider({ children }: { children: React.ReactNode }) {
  const [vehicles, setVehicles] = useState<FleetVehicleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const dedupeByPlate = useCallback((list: FleetVehicleItem[]) => {
    const seen = new Set<string>()
    return list.filter((v) => {
      const plate = (v.plateNumber ?? '').trim().toLowerCase()
      if (!plate || seen.has(plate)) return false
      seen.add(plate)
      return true
    })
  }, [])

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getFleetVehicles()
      const list = Array.isArray(data) ? data : []
      setVehicles(dedupeByPlate(list))
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load vehicles'
      setError(msg)
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }, [dedupeByPlate])

  useEffect(() => {
    refetch()
  }, [refetch])

  const value = useMemo(
    () => ({ vehicles, loading, error, refetch }),
    [vehicles, loading, error, refetch]
  )

  return (
    <FleetVehiclesContext.Provider value={value}>
      {children}
    </FleetVehiclesContext.Provider>
  )
}

export function useFleetVehicles(): FleetVehiclesContextValue {
  const ctx = useContext(FleetVehiclesContext)
  if (!ctx) {
    return {
      vehicles: [],
      loading: false,
      error: 'FleetVehiclesProvider not found',
      refetch: async () => {},
    }
  }
  return ctx
}
