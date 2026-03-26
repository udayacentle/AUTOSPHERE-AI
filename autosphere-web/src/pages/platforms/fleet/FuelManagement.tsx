import { useMemo, useState } from 'react'
import { api, type FleetFuelLogItem } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useFleetRole } from '../../../contexts/FleetRoleContext'
import FleetScreen from './FleetScreen'

export default function FuelManagement() {
  const { role } = useFleetRole()
  const canEdit = role === 'entity_admin' || role === 'super_admin'
  const { data = [], loading, error, refetch } = useApiData<FleetFuelLogItem[]>(() => api.getFleetFuelLogs(100))
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [liters, setLiters] = useState('')
  const [pricePerLiter, setPricePerLiter] = useState('')
  const [odometerKm, setOdometerKm] = useState('')
  const [station, setStation] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const totalCost = useMemo(() => {
    const l = Number(liters || 0)
    const p = Number(pricePerLiter || 0)
    return Number.isFinite(l * p) ? (l * p).toFixed(2) : '0.00'
  }, [liters, pricePerLiter])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!vehiclePlate.trim() || Number(liters) <= 0) {
      setFormError('Vehicle plate and liters are required.')
      return
    }
    setSaving(true)
    try {
      await api.addFleetFuelLog({
        vehiclePlate: vehiclePlate.trim(),
        liters: Number(liters),
        pricePerLiter: Number(pricePerLiter || 0),
        odometerKm: Number(odometerKm || 0),
        station: station.trim(),
      })
      setVehiclePlate('')
      setLiters('')
      setPricePerLiter('')
      setOdometerKm('')
      setStation('')
      await refetch()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save fuel entry.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <FleetScreen title="Fuel Management" subtitle="Record fuel purchases and monitor fleet fuel usage.">
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </FleetScreen>
    )
  }

  return (
    <FleetScreen title="Fuel Management" subtitle="Record fuel purchases and monitor fleet fuel usage.">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>Refresh</button>
      </div>
      {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>}

      {canEdit && (
        <section className="card" style={{ marginBottom: '1rem' }}>
          <h3 style={{ marginTop: 0 }}>Add fuel log</h3>
          <form
            onSubmit={submit}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}
          >
            <input value={vehiclePlate} onChange={(e) => setVehiclePlate(e.target.value)} placeholder="Vehicle plate" />
            <input value={liters} onChange={(e) => setLiters(e.target.value)} type="number" min="0" step="0.1" placeholder="Liters" />
            <input value={pricePerLiter} onChange={(e) => setPricePerLiter(e.target.value)} type="number" min="0" step="0.01" placeholder="Price / liter" />
            <input value={odometerKm} onChange={(e) => setOdometerKm(e.target.value)} type="number" min="0" step="1" placeholder="Odometer (km)" />
            <input value={station} onChange={(e) => setStation(e.target.value)} placeholder="Station (optional)" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total:</span>
              <strong>${totalCost}</strong>
            </div>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save fuel log'}
            </button>
          </form>
          {formError && <p style={{ color: 'var(--danger)', marginTop: '0.5rem' }}>{formError}</p>}
        </section>
      )}

      <section className="card">
        <h3 style={{ marginTop: 0 }}>Fuel history</h3>
        {data.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No fuel logs found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="fleet-trips-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vehicle</th>
                  <th>Liters</th>
                  <th>Price/L</th>
                  <th>Total</th>
                  <th>Odometer</th>
                  <th>Station</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={row._id ?? row.id ?? idx}>
                    <td>{row.date}</td>
                    <td>{row.vehiclePlate}</td>
                    <td>{row.liters}</td>
                    <td>${row.pricePerLiter?.toFixed?.(2) ?? row.pricePerLiter}</td>
                    <td>${row.totalCost?.toFixed?.(2) ?? row.totalCost}</td>
                    <td>{row.odometerKm}</td>
                    <td>{row.station || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </FleetScreen>
  )
}
