import { useState, useEffect } from 'react'
import { useI18n } from '../../../i18n/context'
import { api, type FleetTripItem } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import FleetScreen from './FleetScreen'
import './Trips.css'

const TRIP_LIMIT_OPTIONS = [25, 50, 100, 200]

const FALLBACK_TRIPS: FleetTripItem[] = [
  { id: 'trip-1', driverId: 'demo_driver', date: '2025-03-12', distanceKm: 45, durationMin: 62, startLocation: 'San Francisco, CA', endLocation: 'SFO Airport', score: 88 },
  { id: 'trip-2', driverId: 'demo_driver', date: '2025-03-11', distanceKm: 23, durationMin: 35, startLocation: 'Oakland', endLocation: 'Downtown SF', score: 92 },
  { id: 'trip-3', driverId: 'demo_driver', date: '2025-03-10', distanceKm: 78, durationMin: 95, startLocation: 'San Jose', endLocation: 'Palo Alto', score: 85 },
  { id: 'trip-4', driverId: 'demo_driver', date: '2025-03-09', distanceKm: 12, durationMin: 18, startLocation: 'Mission District', endLocation: 'SOMA', score: 90 },
  { id: 'trip-5', driverId: 'demo_driver', date: '2025-03-08', distanceKm: 56, durationMin: 72, startLocation: 'SFO Airport', endLocation: 'Berkeley', score: 82 },
]

export default function FleetTrips() {
  const { t } = useI18n()
  const [limit, setLimit] = useState(50)
  const { data, loading, error, refetch } = useApiData<FleetTripItem[] | null>(
    () => api.getFleetTrips(limit)
  )
  const trips = Array.isArray(data) ? data : (error ? FALLBACK_TRIPS : [])

  useEffect(() => {
    refetch()
  }, [limit])

  if (loading) {
    return (
      <FleetScreen title={t('fleet.tripsTitle')} subtitle={t('fleet.tripsSubtitle')}>
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </FleetScreen>
    )
  }

  const totalDistance = trips.reduce((sum, trip) => sum + (trip.distanceKm ?? 0), 0)
  const totalDuration = trips.reduce((sum, trip) => sum + (trip.durationMin ?? 0), 0)
  const avgScore = trips.length ? Math.round(trips.reduce((s, trip) => s + (trip.score ?? 0), 0) / trips.length) : 0

  return (
    <FleetScreen title={t('fleet.tripsTitle')} subtitle={t('fleet.tripsSubtitle')}>
      <div className="fleet-trips-toolbar">
        <div className="fleet-trips-stats">
          <span>{t('fleet.tripsCount')}: <strong>{trips.length}</strong></span>
          <span>{t('fleet.totalDistance')}: <strong>{totalDistance} km</strong></span>
          <span>{t('fleet.totalDuration')}: <strong>{totalDuration} min</strong></span>
          <span>{t('fleet.avgScore')}: <strong>{avgScore}</strong></span>
        </div>
        <div className="fleet-trips-actions">
          <label>
            {t('fleet.showLimit')}{' '}
            <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
              {TRIP_LIMIT_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
          <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
        </div>
      </div>
      {error && (
        <p className="fleet-offline-banner" style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: 8 }}>
          {t('fleet.showingSampleData')}
        </p>
      )}
      <section className="fleet-data-card card">
        <h3>{t('fleet.tripsList')}</h3>
        {trips.length === 0 ? (
          <p className="fleet-empty">{t('fleet.noTrips')}</p>
        ) : (
          <div className="fleet-trips-table-wrap">
            <table className="fleet-trips-table">
              <thead>
                <tr>
                  <th>{t('fleet.date')}</th>
                  <th>{t('fleet.driverId')}</th>
                  <th>{t('fleet.distance')}</th>
                  <th>{t('fleet.duration')}</th>
                  <th>{t('fleet.startLocation')}</th>
                  <th>{t('fleet.endLocation')}</th>
                  <th>{t('fleet.score')}</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip) => (
                  <tr key={trip.id}>
                    <td>{trip.date}</td>
                    <td><code>{trip.driverId}</code></td>
                    <td>{trip.distanceKm} km</td>
                    <td>{trip.durationMin} min</td>
                    <td>{trip.startLocation || '—'}</td>
                    <td>{trip.endLocation || '—'}</td>
                    <td>{trip.score ?? 0}</td>
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
