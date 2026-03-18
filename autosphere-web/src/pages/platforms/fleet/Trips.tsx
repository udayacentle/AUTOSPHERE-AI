import { useState, useEffect } from 'react'
import { useI18n } from '../../../i18n/context'
import { api, type FleetTripItem } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import FleetScreen from './FleetScreen'
import './Trips.css'

const TRIP_LIMIT_OPTIONS = [25, 50, 100, 200]
const TRIP_STATUSES: Array<FleetTripItem['status']> = ['pending', 'assigned', 'in_progress', 'completed', 'rejected'].filter(Boolean) as Array<FleetTripItem['status']>

const FALLBACK_TRIPS: FleetTripItem[] = [
  { id: 'trip-1', driverId: 'driver1', passengerId: 'user-passenger-1', date: '2025-03-12', distanceKm: 45, durationMin: 62, startLocation: 'San Francisco, CA', endLocation: 'SFO Airport', score: 88, status: 'completed' },
  { id: 'trip-2', driverId: 'driver1', passengerId: 'user-passenger-2', date: '2025-03-11', distanceKm: 23, durationMin: 35, startLocation: 'Oakland', endLocation: 'Downtown SF', score: 92, status: 'completed' },
  { id: 'trip-3', driverId: 'user-driver-1', passengerId: 'user-passenger-1', date: '2025-03-10', distanceKm: 78, durationMin: 95, startLocation: 'San Jose', endLocation: 'Palo Alto', score: 85, status: 'completed' },
  { id: 'trip-4', driverId: 'user-driver-2', passengerId: null, date: '2025-03-15', distanceKm: 0, durationMin: 0, startLocation: 'Downtown SF', endLocation: 'SFO Airport', score: 0, status: 'in_progress' },
  { id: 'trip-5', driverId: null, passengerId: 'user-passenger-2', date: '2025-03-16', distanceKm: 0, durationMin: 0, startLocation: 'Berkeley', endLocation: 'Oakland', score: 0, status: 'pending' },
]

export default function FleetTrips() {
  const { t } = useI18n()
  const [limit, setLimit] = useState(50)
  const [bookingForm, setBookingForm] = useState(false)
  const [newTrip, setNewTrip] = useState({ startLocation: '', endLocation: '', passengerId: 'user-passenger-1' })
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const { data, loading, error, refetch } = useApiData<FleetTripItem[] | null>(
    () => api.getFleetTrips(limit)
  )
  const trips = Array.isArray(data) ? data : (error ? FALLBACK_TRIPS : [])

  useEffect(() => {
    refetch()
  }, [limit])

  const handleBookTrip = async () => {
    if (!newTrip.startLocation || !newTrip.endLocation) return
    setUpdatingId('book')
    try {
      await api.bookFleetTrip({
        passengerId: newTrip.passengerId || undefined,
        startLocation: newTrip.startLocation,
        endLocation: newTrip.endLocation,
        date: new Date().toISOString().slice(0, 10),
      })
      setNewTrip({ startLocation: '', endLocation: '', passengerId: 'user-passenger-1' })
      setBookingForm(false)
      refetch()
    } catch (e) {
      console.error(e)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleStatusChange = async (tripId: string, status: FleetTripItem['status']) => {
    if (!status) return
    setUpdatingId(tripId)
    try {
      await api.updateFleetTripStatus(tripId, status)
      refetch()
    } catch (e) {
      console.error(e)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleAssign = async (tripId: string, driverId: string) => {
    setUpdatingId(tripId)
    try {
      await api.assignFleetTrip(tripId, { driverId })
      refetch()
    } catch (e) {
      console.error(e)
    } finally {
      setUpdatingId(null)
    }
  }

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
          <button type="button" className="btn-primary" onClick={() => setBookingForm(!bookingForm)}>
            {t('fleet.bookTrip') || 'Book trip'}
          </button>
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

      {bookingForm && (
        <section className="fleet-data-card card fleet-book-trip-card">
          <h3>{t('fleet.bookTrip') || 'Book trip'}</h3>
          <div className="fleet-book-form">
            <input
              type="text"
              placeholder={t('fleet.startLocation') || 'Start'}
              value={newTrip.startLocation}
              onChange={(e) => setNewTrip((p) => ({ ...p, startLocation: e.target.value }))}
            />
            <input
              type="text"
              placeholder={t('fleet.endLocation') || 'End'}
              value={newTrip.endLocation}
              onChange={(e) => setNewTrip((p) => ({ ...p, endLocation: e.target.value }))}
            />
            <button type="button" className="btn-primary" onClick={handleBookTrip} disabled={updatingId === 'book' || !newTrip.startLocation || !newTrip.endLocation}>
              {updatingId === 'book' ? (t('common.loading') || '...') : (t('fleet.submitBook') || 'Submit')}
            </button>
          </div>
        </section>
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
                  <th>{t('fleet.tripStatus')}</th>
                  <th>{t('fleet.driverId')}</th>
                  <th>{t('fleet.passengerId') || 'Passenger'}</th>
                  <th>{t('fleet.distance')}</th>
                  <th>{t('fleet.duration')}</th>
                  <th>{t('fleet.startLocation')}</th>
                  <th>{t('fleet.endLocation')}</th>
                  <th>{t('fleet.score')}</th>
                  <th>{t('fleet.actions') || 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip) => (
                  <tr key={trip.id}>
                    <td>{trip.date}</td>
                    <td><span className={`fleet-trip-status fleet-trip-status-${trip.status || 'pending'}`}>{trip.status || 'pending'}</span></td>
                    <td><code>{trip.driverId ?? '—'}</code></td>
                    <td><code>{trip.passengerId ?? '—'}</code></td>
                    <td>{trip.distanceKm ?? 0} km</td>
                    <td>{trip.durationMin ?? 0} min</td>
                    <td>{trip.startLocation || '—'}</td>
                    <td>{trip.endLocation || '—'}</td>
                    <td>{trip.score ?? 0}</td>
                    <td className="fleet-trip-actions">
                      {trip.status !== 'completed' && trip.status !== 'rejected' && (
                        <>
                          <select
                            value=""
                            onChange={(e) => { const v = e.target.value; if (v) handleStatusChange(trip.id, v as FleetTripItem['status']); }}
                            disabled={!!updatingId}
                          >
                            <option value="">Update status</option>
                            {TRIP_STATUSES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          {trip.status === 'pending' && (
                            <button type="button" className="btn-small" onClick={() => handleAssign(trip.id, 'user-driver-1')} disabled={!!updatingId}>
                              Assign
                            </button>
                          )}
                        </>
                      )}
                    </td>
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
