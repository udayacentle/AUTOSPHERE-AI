import DriverScreen from './DriverScreen'
import { api, type Trip } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'

function formatDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, { dateStyle: 'medium' })
}

export default function TripHistory() {
  const { data: trips = [], loading, error, refetch } = useApiData<Trip[]>(() => api.getTrips())

  if (loading) {
    return (
      <DriverScreen title="Trip History & Trip Summary" subtitle="Past trips and summaries">
        <p style={{ color: 'var(--text-secondary)' }}>Loading…</p>
      </DriverScreen>
    )
  }
  if (error) {
    return (
      <DriverScreen title="Trip History & Trip Summary" subtitle="Past trips and summaries">
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>Refresh</button>
      </DriverScreen>
    )
  }

  const list = Array.isArray(trips) ? trips : []

  return (
    <DriverScreen title="Trip History & Trip Summary" subtitle="Past trips and summaries">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>Refresh</button>
      </div>
      <ul className="screen-list">
        {list.map((t) => (
          <li key={t.id}>
            <span>
              {t.distanceKm} km · {t.durationMin} min · {t.startLocation} → {t.endLocation} · {formatDate(t.date)} ·
              Score {t.score}
            </span>
          </li>
        ))}
      </ul>
      {list.length === 0 && (
        <p style={{ color: 'var(--text-secondary)' }}>No trips recorded yet.</p>
      )}
      <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        Data refreshes automatically; switch back to this tab or click Refresh to see DB changes.
      </p>
    </DriverScreen>
  )
}
