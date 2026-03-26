import { useEffect, useState } from 'react'
import { api, type FleetAlertItem } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useFleetRole } from '../../../contexts/FleetRoleContext'
import FleetScreen from './FleetScreen'

type Filter = 'all' | 'open' | 'resolved'

export default function AlertsNotifications() {
  const { role } = useFleetRole()
  const canUpdate = role === 'entity_admin' || role === 'super_admin'
  const [filter, setFilter] = useState<Filter>('all')
  const { data = [], loading, error, refetch } = useApiData<FleetAlertItem[]>(
    () => api.getFleetAlerts(filter, 100),
    { pollInterval: 20_000 }
  )

  useEffect(() => {
    refetch()
  }, [filter, refetch])

  const setStatus = async (id: string, status: 'open' | 'resolved') => {
    try {
      await api.updateFleetAlertStatus(id, status)
      await refetch()
    } catch {
      // keep UI simple; next refresh/poll reflects server state
    }
  }

  if (loading) {
    return (
      <FleetScreen title="Alerts & Notifications" subtitle="Geofence, speed, and maintenance alerts.">
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </FleetScreen>
    )
  }

  return (
    <FleetScreen title="Alerts & Notifications" subtitle="Geofence, speed, and maintenance alerts.">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="btn-refresh" onClick={() => setFilter('all')}>All</button>
          <button type="button" className="btn-refresh" onClick={() => setFilter('open')}>Open</button>
          <button type="button" className="btn-refresh" onClick={() => setFilter('resolved')}>Resolved</button>
        </div>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>Refresh</button>
      </div>
      {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>}

      <section className="card">
        <h3 style={{ marginTop: 0 }}>Alert feed</h3>
        {data.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No alerts found.</p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {data.map((a, idx) => {
              const id = a._id ?? a.id ?? `alert-${idx}`
              return (
                <li
                  key={id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.1fr 1fr auto',
                    gap: '0.75rem',
                    alignItems: 'center',
                    padding: '0.75rem 0',
                    borderBottom: '1px solid var(--border-subtle, rgba(0,0,0,0.06))',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{a.message}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {(a.type || 'alert').replaceAll('_', ' ')} · {(a.vehiclePlate || 'N/A')} · {(a.driverId || 'N/A')}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Severity: <strong style={{ color: 'var(--text-primary)' }}>{a.severity}</strong><br />
                    Status: <strong style={{ color: 'var(--text-primary)' }}>{a.status}</strong>
                  </div>
                  {canUpdate ? (
                    a.status === 'resolved' ? (
                      <button type="button" className="btn-refresh" onClick={() => setStatus(id, 'open')}>Re-open</button>
                    ) : (
                      <button type="button" className="btn-primary" onClick={() => setStatus(id, 'resolved')}>Resolve</button>
                    )
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Read only</span>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </FleetScreen>
  )
}
