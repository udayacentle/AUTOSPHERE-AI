import { useState } from 'react'
import DriverScreen from './DriverScreen'
import { api, type DriverParkingData, type ParkingLotItem, type ParkingBookingItem } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import './Parking.css'

const FALLBACK_PARKING: DriverParkingData = {
  lots: [
    { id: 'lot-1', name: 'SOMA Garage', address: '555 Howard St, San Francisco, CA', availableSpots: 12, totalSpots: 50, pricePerHour: 4.5, lat: 37.787, lng: -122.396, distanceKm: '0.8' },
    { id: 'lot-2', name: 'Mission Bay Lot', address: '255 King St, San Francisco, CA', availableSpots: 28, totalSpots: 80, pricePerHour: 3.5, lat: 37.769, lng: -122.393, distanceKm: '1.5' },
    { id: 'lot-3', name: 'Downtown Plaza', address: '100 1st St, San Francisco, CA', availableSpots: 5, totalSpots: 40, pricePerHour: 6, lat: 37.785, lng: -122.401, distanceKm: '0.5' },
  ],
  activeBooking: null,
}

const DURATION_OPTIONS = [1, 2, 4, 8]

export default function Parking() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<DriverParkingData | null>(() => api.getDriverParking())
  const parking = data ?? (error ? FALLBACK_PARKING : null)

  const [selectedLotId, setSelectedLotId] = useState<string | null>(null)
  const [durationHours, setDurationHours] = useState(1)
  const [booking, setBooking] = useState<ParkingBookingItem | null>(parking?.activeBooking ?? null)
  const [bookingInProgress, setBookingInProgress] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [cancelling, setCancelling] = useState(false)

  const activeBooking = booking ?? parking?.activeBooking ?? null
  const lots = parking?.lots ?? []

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault()
    setBookingError('')
    if (!selectedLotId) {
      setBookingError(t('parking.selectLotError'))
      return
    }
    setBookingInProgress(true)
    try {
      const result = await api.bookParkingSlot(selectedLotId, durationHours)
      if (result?.success && result.booking) {
        setBooking(result.booking)
        setSelectedLotId(null)
        setDurationHours(1)
        refetch()
      } else {
        setBookingError((result as { error?: string })?.error || 'Booking failed')
      }
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'Booking failed')
    } finally {
      setBookingInProgress(false)
    }
  }

  const handleCancelBooking = async () => {
    setCancelling(true)
    setBookingError('')
    try {
      await api.cancelParkingBooking()
      setBooking(null)
      refetch()
    } catch {
      setBookingError('Failed to cancel booking')
    } finally {
      setCancelling(false)
    }
  }

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso)
      return d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
    } catch {
      return iso
    }
  }

  if (loading) {
    return (
      <DriverScreen title="Parking Map & Booking" subtitle="Find and reserve parking">
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </DriverScreen>
    )
  }

  return (
    <DriverScreen title="Parking Map & Booking" subtitle="Find and reserve parking">
      <div className="parking-page">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
      {error && (
        <p style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: 8 }}>
          {t('fleet.showingSampleData')}
        </p>
      )}

      {parking && (
        <>
          <section className="card" style={{ marginBottom: '1.5rem' }}>
            <h3>{t('parking.mapTitle')}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {lots.length} {t('parking.mapHint')}
            </p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
              <a
                href={`https://www.google.com/maps/search/parking+near+San+Francisco`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--accent)' }}
              >
                {t('parking.openInMaps')} →
              </a>
            </p>
          </section>

          {activeBooking ? (
            <section className="card parking-active-booking" style={{ marginBottom: '1.5rem' }}>
              <h3>{t('parking.activeBooking')}</h3>
              <p style={{ margin: '0.25rem 0', fontWeight: 600 }}>{activeBooking.lotName}</p>
              <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{activeBooking.address}</p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
                {formatTime(activeBooking.startTime)} – {formatTime(activeBooking.endTime)}
              </p>
              <p style={{ margin: '0.25rem 0' }}>Total: <strong>${activeBooking.totalPrice.toFixed(2)}</strong></p>
              <button
                type="button"
                className="btn-refresh"
                style={{ marginTop: '0.75rem' }}
                onClick={handleCancelBooking}
                disabled={cancelling}
              >
                {cancelling ? t('parking.cancelling') : t('parking.cancelBooking')}
              </button>
            </section>
          ) : (
            <section className="card" style={{ marginBottom: '1.5rem' }}>
              <h3>{t('parking.bookSlot')}</h3>
              <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 400 }}>
                <label>
                  <span style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>{t('parking.selectLot')}</span>
                  <select
                    value={selectedLotId ?? ''}
                    onChange={(e) => setSelectedLotId(e.target.value || null)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid var(--border)' }}
                  >
                    <option value="">{t('parking.selectLotPlaceholder')}</option>
                    {lots.map((lot) => (
                      <option key={lot.id} value={lot.id}>
                        {lot.name} — ${lot.pricePerHour}/hr · {lot.availableSpots} free
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>{t('parking.duration')}</span>
                  <select
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid var(--border)' }}
                  >
                    {DURATION_OPTIONS.map((h) => (
                      <option key={h} value={h}>{h} {h === 1 ? t('parking.hour') : t('parking.hours')}</option>
                    ))}
                  </select>
                </label>
                {selectedLotId && (
                  <p style={{ fontSize: '0.9rem', margin: 0 }}>
                    {t('parking.estimatedTotal')}: <strong>${((lots.find((l) => l.id === selectedLotId)?.pricePerHour ?? 0) * durationHours).toFixed(2)}</strong>
                  </p>
                )}
                {bookingError && <p style={{ color: 'var(--danger)', margin: 0, fontSize: '0.9rem' }}>{bookingError}</p>}
                <button type="submit" className="btn-primary" disabled={bookingInProgress || !selectedLotId}>
                  {bookingInProgress ? t('parking.booking') : t('parking.bookSlotButton')}
                </button>
              </form>
            </section>
          )}

          <section className="card">
            <h3>{t('parking.availableLots')}</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {lots.map((lot: ParkingLotItem) => (
                <li key={lot.id} className="parking-lot-item">
                  <p style={{ margin: '0.25rem 0', fontWeight: 600 }}>{lot.name}</p>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{lot.address}</p>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                    <strong>{lot.availableSpots}</strong> / {lot.totalSpots} free · ${lot.pricePerHour}/hr · {String(lot.distanceKm)} km
                  </p>
                  <a
                    href={`https://www.google.com/maps?q=${lot.lat},${lot.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.85rem', color: 'var(--accent)' }}
                  >
                    {t('parking.directions')}
                  </a>
                </li>
              ))}
            </ul>
            {lots.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>{t('parking.noLots')}</p>}
          </section>
        </>
      )}

      {!parking && !loading && (
        <p style={{ color: 'var(--danger)' }}>{error ?? 'Unable to load parking data'}</p>
      )}
      </div>
    </DriverScreen>
  )
}
