import DriverScreen from './DriverScreen'
import { api, type MobilityScoreData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'

export default function MobilityScore() {
  const { data, loading, error, refetch } = useApiData<MobilityScoreData>(() => api.getMobilityScore())

  if (loading) {
    return (
      <DriverScreen
        title="Mobility Score (Vehicle Intelligence Index)"
        subtitle="AI-powered score based on driving, vehicle health, and usage"
      >
        <p style={{ color: 'var(--text-secondary)' }}>Loading…</p>
      </DriverScreen>
    )
  }
  if (error) {
    return (
      <DriverScreen
        title="Mobility Score (Vehicle Intelligence Index)"
        subtitle="AI-powered score based on driving, vehicle health, and usage"
      >
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>Refresh</button>
      </DriverScreen>
    )
  }

  const score = data ?? { overall: 0, drivingBehavior: 0, vehicleCondition: 0, usagePatterns: 0 }
  const hasData = score.overall > 0 || score.drivingBehavior > 0 || score.vehicleCondition > 0 || score.usagePatterns > 0

  return (
    <DriverScreen
      title="Mobility Score (Vehicle Intelligence Index)"
      subtitle="AI-powered score based on driving, vehicle health, and usage"
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>Refresh</button>
      </div>
      {!hasData && (
        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          No score data yet. Scores will appear here when data is available from your connected vehicle and trips.
        </p>
      )}
      <div className="card-grid">
        <div className="card">
          <h3>Overall score</h3>
          <p>{hasData ? `${score.overall} / 100` : '— / 100'}</p>
        </div>
        <div className="card">
          <h3>Driving behavior</h3>
          <p>{hasData ? `${score.drivingBehavior} — Safety & efficiency` : '—'}</p>
        </div>
        <div className="card">
          <h3>Vehicle condition</h3>
          <p>{hasData ? `${score.vehicleCondition} — Health & maintenance` : '—'}</p>
        </div>
        <div className="card">
          <h3>Usage patterns</h3>
          <p>{hasData ? `${score.usagePatterns} — Trips, fuel, carbon` : '—'}</p>
        </div>
        <div className="card">
          <h3>Recommendations</h3>
          <p>Improve your score</p>
        </div>
      </div>
    </DriverScreen>
  )
}
