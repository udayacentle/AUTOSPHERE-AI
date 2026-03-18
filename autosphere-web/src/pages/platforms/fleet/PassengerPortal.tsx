import { useState, useEffect } from 'react'
import { useI18n } from '../../../i18n/context'
import { api, type FleetTripItem } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import FleetScreen from './FleetScreen'
import './FleetBrd.css'

const PASSENGERS = [
  { id: 'user-passenger-1', label: 'Alex Rider' },
  { id: 'user-passenger-2', label: 'Sam Carter' },
]

export default function PassengerPortal() {
  const { t } = useI18n()
  const [passengerId, setPassengerId] = useState(PASSENGERS[0].id)
  const [book, setBook] = useState({ start: '', end: '' })
  const [booking, setBooking] = useState(false)

  const { data, loading, error, refetch } = useApiData<FleetTripItem[] | null>(() =>
    api.getFleetTripsPassenger(passengerId, 80)
  )

  useEffect(() => {
    refetch()
  }, [passengerId])

  const trips = Array.isArray(data) ? data : []

  const handleBook = async () => {
    if (!book.start || !book.end) return
    setBooking(true)
    try {
      await api.bookFleetTrip({
        passengerId,
        startLocation: book.start,
        endLocation: book.end,
        date: new Date().toISOString().slice(0, 10),
      })
      setBook({ start: '', end: '' })
      refetch()
    } catch {
      /* ignore */
    } finally {
      setBooking(false)
    }
  }

  return (
    <FleetScreen title={t('fleet.brdPassengerTitle')} subtitle={t('fleet.brdPassengerSubtitle')}>
      <div className="fleet-brd-toolbar">
        <label>
          {t('fleet.brdPassengerSelect')}{' '}
          <select value={passengerId} onChange={(e) => setPassengerId(e.target.value)}>
            {PASSENGERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>
          {t('common.refresh')}
        </button>
      </div>

      <section className="card fleet-brd-card">
        <h3>{t('fleet.bookTrip')}</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
          <input
            type="text"
            placeholder={t('fleet.startLocation')}
            value={book.start}
            onChange={(e) => setBook((b) => ({ ...b, start: e.target.value }))}
            style={{ flex: '1 1 140px', padding: '0.5rem', borderRadius: 8, border: '1px solid var(--border)' }}
          />
          <input
            type="text"
            placeholder={t('fleet.endLocation')}
            value={book.end}
            onChange={(e) => setBook((b) => ({ ...b, end: e.target.value }))}
            style={{ flex: '1 1 140px', padding: '0.5rem', borderRadius: 8, border: '1px solid var(--border)' }}
          />
          <button type="button" className="btn-refresh" disabled={booking || !book.start || !book.end} onClick={handleBook}>
            {booking ? t('common.loading') : t('fleet.submitBook')}
          </button>
        </div>
      </section>

      <section className="card fleet-brd-card">
        <h3>{t('fleet.brdTripHistory')}</h3>
        {loading ? (
          <p>{t('common.loading')}</p>
        ) : error ? (
          <p>{t('fleet.showingSampleData')}</p>
        ) : trips.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>{t('fleet.noTrips')}</p>
        ) : (
          <table className="fleet-brd-table">
            <thead>
              <tr>
                <th>Route</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => (
                <tr key={trip.id}>
                  <td>
                    {trip.startLocation} → {trip.endLocation}
                  </td>
                  <td>{trip.date}</td>
                  <td>{trip.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </FleetScreen>
  )
}
