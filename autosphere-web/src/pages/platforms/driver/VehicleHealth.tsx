import DriverScreen from './DriverScreen'
import { api, type VehicleHealthData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'

export default function VehicleHealth() {
  const { data, loading, error, refetch } = useApiData<VehicleHealthData>(() => api.getVehicleHealth())

  if (loading) {
    return (
      <DriverScreen title="Vehicle Health Breakdown" subtitle="Component-wise health status">
        <p style={{ color: 'var(--text-secondary)' }}>Loading…</p>
      </DriverScreen>
    )
  }
  if (error) {
    return (
      <DriverScreen title="Vehicle Health Breakdown" subtitle="Component-wise health status">
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>Refresh</button>
      </DriverScreen>
    )
  }

  const vehicleLabel = data?.vehicle ? `${data.vehicle.make} ${data.vehicle.model}` : '—'
  const health = data?.health ?? { engine: 0, battery: 0, brakesTires: 0, fluids: 0, electrical: 0 }

  return (
    <DriverScreen title="Vehicle Health Breakdown" subtitle="Component-wise health status">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>Refresh</button>
      </div>
      {data?.vehicle && (
        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
          {vehicleLabel} — Overall health: {data.vehicle.healthScore}%
        </p>
      )}
      <div className="card-grid">
        <div className="card">
          <h3>Engine</h3>
          <p>{health.engine}% — Status & diagnostics</p>
        </div>
        <div className="card">
          <h3>Battery</h3>
          <p>{health.battery}% — Charge, age, SOH</p>
        </div>
        <div className="card">
          <h3>Brakes & tires</h3>
          <p>{health.brakesTires}% — Wear, pressure</p>
        </div>
        <div className="card">
          <h3>Fluids</h3>
          <p>{health.fluids}% — Oil, coolant, etc.</p>
        </div>
        <div className="card">
          <h3>Electrical</h3>
          <p>{health.electrical}% — Lights, sensors</p>
        </div>
      </div>
    </DriverScreen>
  )
}
