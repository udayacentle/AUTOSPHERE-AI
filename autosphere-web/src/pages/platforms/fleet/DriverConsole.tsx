import { useState, useEffect } from 'react'
import { useI18n } from '../../../i18n/context'
import { api, type FleetTripItem } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import FleetScreen from './FleetScreen'
import './FleetBrd.css'

const DRIVERS = [
  { id: 'user-driver-1', label: 'James Wilson (user-driver-1)' },
  { id: 'user-driver-2', label: 'Maria Santos (user-driver-2)' },
]

export default function DriverConsole() {
  const { t } = useI18n()
  const [driverId, setDriverId] = useState(DRIVERS[0].id)
  const { data, loading, error, refetch } = useApiData<FleetTripItem[] | null>(() =>
    driverId ? api.getFleetTripsAssigned(driverId, 80) : Promise.resolve([])
  )

  useEffect(() => {
    refetch()
  }, [driverId])

  const trips = Array.isArray(data) ? data : []

  const onRespond = async (tripId: string, action: 'accept' | 'reject') => {
    await api.respondFleetTrip(tripId, { driverId, action })
    refetch()
  }

  const onStatus = async (tripId: string, status: FleetTripItem['status']) => {
    if (!status) return
    await api.updateFleetTripStatus(tripId, status)
    refetch()
  }

  return (
    <FleetScreen
      title={t('fleet.brdDriverTitle')}
      subtitle={t('fleet.brdDriverSubtitle')}
    >
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        {t('fleet.brdDriverNote')}
      </p>
      <div className="fleet-brd-toolbar">
        <label>
          {t('fleet.brdDriverSelect')}{' '}
          <select value={driverId} onChange={(e) => setDriverId(e.target.value)}>
            {DRIVERS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>
          {t('common.refresh')}
        </button>
      </div>
      {error && (
        <p className="fleet-offline-banner" style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: 8 }}>
          {t('fleet.showingSampleData')}
        </p>
      )}
      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      ) : (
        <section className="card fleet-brd-card">
          <h3>{t('fleet.brdAssignedTrips')}</h3>
          {trips.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>{t('fleet.brdNoAssignedTrips')}</p>
          ) : (
            <table className="fleet-brd-table">
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>{t('fleet.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip) => (
                  <tr key={trip.id}>
                    <td>
                      {trip.startLocation || '—'} → {trip.endLocation || '—'}
                    </td>
                    <td>{trip.date}</td>
                    <td>{trip.status}</td>
                    <td>
                      <div className="fleet-brd-actions">
                        {trip.status === 'assigned' && (
                          <>
                            <button type="button" onClick={() => onRespond(trip.id, 'accept')}>
                              {t('fleet.brdAccept')}
                            </button>
                            <button type="button" onClick={() => onRespond(trip.id, 'reject')}>
                              {t('fleet.brdReject')}
                            </button>
                          </>
                        )}
                        {trip.status === 'in_progress' && (
                          <>
                            <button type="button" onClick={() => onStatus(trip.id, 'completed')}>
                              {t('fleet.brdMarkComplete')}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </FleetScreen>
  )
}
