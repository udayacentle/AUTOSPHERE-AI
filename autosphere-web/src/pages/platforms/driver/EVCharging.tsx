import { useState } from 'react'
import DriverScreen from './DriverScreen'
import {
  api,
  type DriverEVChargingData,
  type EVChargingStationItem,
  type EVChargingSessionItem,
} from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import './EVCharging.css'

const FALLBACK_EV: DriverEVChargingData = {
  stations: [
    {
      id: 'ev-1',
      name: 'Electrify America - SOMA',
      address: '699 Minna St, San Francisco, CA',
      availableConnectors: 3,
      totalConnectors: 4,
      connectorTypes: ['CCS', 'CHAdeMO'],
      powerKw: 150,
      pricePerKwh: 0.43,
      lat: 37.776,
      lng: -122.409,
      distanceKm: '0.6',
    },
    {
      id: 'ev-2',
      name: 'Tesla Supercharger - Mission Bay',
      address: '255 King St, San Francisco, CA',
      availableConnectors: 6,
      totalConnectors: 8,
      connectorTypes: ['Tesla'],
      powerKw: 250,
      pricePerKwh: 0.36,
      lat: 37.769,
      lng: -122.393,
      distanceKm: '1.4',
    },
    {
      id: 'ev-3',
      name: 'ChargePoint - Downtown',
      address: '100 1st St, San Francisco, CA',
      availableConnectors: 2,
      totalConnectors: 4,
      connectorTypes: ['CCS', 'Type 2'],
      powerKw: 62,
      pricePerKwh: 0.38,
      lat: 37.785,
      lng: -122.401,
      distanceKm: '0.5',
    },
  ],
  activeSession: null,
  usageSummary: {
    totalKwhThisMonth: 124,
    totalCostThisMonth: 48.52,
    sessionCountThisMonth: 8,
    lastSessionDate: new Date().toISOString().slice(0, 10),
    currency: 'USD',
  },
}

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120]

export default function EVCharging() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<DriverEVChargingData | null>(() =>
    api.getDriverEVCharging()
  )
  const evData = data ?? (error ? FALLBACK_EV : null)

  const [selectedStationId, setSelectedStationId] = useState<string | null>(null)
  const [connectorType, setConnectorType] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(30)
  const [session, setSession] = useState<EVChargingSessionItem | null>(evData?.activeSession ?? null)
  const [bookingInProgress, setBookingInProgress] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [ending, setEnding] = useState(false)

  const activeSession = session ?? evData?.activeSession ?? null
  const stations = evData?.stations ?? []
  const usage = evData?.usageSummary ?? null

  const selectedStation = selectedStationId
    ? stations.find((s) => s.id === selectedStationId)
    : null

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault()
    setBookingError('')
    if (!selectedStationId) {
      setBookingError(t('evCharging.selectStationError'))
      return
    }
    const station = stations.find((s) => s.id === selectedStationId)
    const type = connectorType || (station?.connectorTypes?.[0] ?? 'CCS')
    setBookingInProgress(true)
    try {
      const result = await api.bookEVChargingSlot(selectedStationId, type, durationMinutes)
      if (result?.success && result.session) {
        setSession(result.session)
        setSelectedStationId(null)
        setConnectorType('')
        setDurationMinutes(30)
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

  const handleEndSession = async () => {
    setEnding(true)
    setBookingError('')
    try {
      await api.cancelEVChargingBooking()
      setSession(null)
      refetch()
    } catch {
      setBookingError('Failed to end session')
    } finally {
      setEnding(false)
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

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr + 'Z').toLocaleDateString(undefined, { dateStyle: 'medium' })
    } catch {
      return dateStr
    }
  }

  if (loading) {
    return (
      <DriverScreen
        title="EV Charging Booking & Usage Analytics"
        subtitle="Find chargers, book, and view usage"
      >
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </DriverScreen>
    )
  }

  return (
    <DriverScreen
      title="EV Charging Booking & Usage Analytics"
      subtitle="Find chargers, book, and view usage"
    >
      <div className="ev-charging-page">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button type="button" className="btn-refresh" onClick={() => refetch()}>
            {t('common.refresh')}
          </button>
        </div>
        {error && (
          <p
            style={{
              marginBottom: '1rem',
              padding: '0.75rem',
              background: 'var(--bg-elevated)',
              borderRadius: 8,
            }}
          >
            {t('fleet.showingSampleData')}
          </p>
        )}

        {evData && (
          <>
            <section className="card ev-card" style={{ marginBottom: '1.5rem' }}>
              <h3>{t('evCharging.findChargers')}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {stations.length} {t('evCharging.mapHint')}
              </p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                <a
                  href="https://www.google.com/maps/search/EV+charging+near+San+Francisco"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent)' }}
                >
                  {t('evCharging.openInMaps')} →
                </a>
              </p>
            </section>

            {usage && (
              <section className="card ev-card ev-usage-card" style={{ marginBottom: '1.5rem' }}>
                <h3>{t('evCharging.usageAnalytics')}</h3>
                <div className="ev-usage-grid">
                  <div>
                    <span className="ev-usage-label">{t('evCharging.totalKwh')}</span>
                    <span className="ev-usage-value">{usage.totalKwhThisMonth} kWh</span>
                  </div>
                  <div>
                    <span className="ev-usage-label">{t('evCharging.totalCost')}</span>
                    <span className="ev-usage-value">
                      {usage.currency} {usage.totalCostThisMonth.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="ev-usage-label">{t('evCharging.sessionsCount')}</span>
                    <span className="ev-usage-value">{usage.sessionCountThisMonth}</span>
                  </div>
                  <div>
                    <span className="ev-usage-label">{t('evCharging.lastSession')}</span>
                    <span className="ev-usage-value">{formatDate(usage.lastSessionDate)}</span>
                  </div>
                </div>
              </section>
            )}

            {activeSession ? (
              <section
                className="card ev-card ev-active-session"
                style={{ marginBottom: '1.5rem' }}
              >
                <h3>{t('evCharging.activeSession')}</h3>
                <p style={{ margin: '0.25rem 0', fontWeight: 600 }}>{activeSession.stationName}</p>
                <p
                  style={{
                    margin: '0.25rem 0',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {activeSession.address}
                </p>
                <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
                  {activeSession.connectorType} · {activeSession.powerKw} kW
                </p>
                <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                  {formatTime(activeSession.startTime)} – {formatTime(activeSession.endTime)}
                </p>
                <p style={{ margin: '0.25rem 0' }}>
                  ~{activeSession.estimatedKwh} kWh ·{' '}
                  <strong>
                    {activeSession.totalCost.toFixed(2)} {usage?.currency ?? 'USD'}
                  </strong>
                </p>
                <button
                  type="button"
                  className="btn-refresh"
                  style={{ marginTop: '0.75rem' }}
                  onClick={handleEndSession}
                  disabled={ending}
                >
                  {ending ? t('evCharging.ending') : t('evCharging.endSession')}
                </button>
              </section>
            ) : (
              <section className="card ev-card" style={{ marginBottom: '1.5rem' }}>
                <h3>{t('evCharging.bookSlot')}</h3>
                <form
                  onSubmit={handleStartSession}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    maxWidth: 420,
                  }}
                >
                  <label>
                    <span
                      style={{
                        display: 'block',
                        marginBottom: '0.25rem',
                        fontSize: '0.9rem',
                      }}
                    >
                      {t('evCharging.selectStation')}
                    </span>
                    <select
                      value={selectedStationId ?? ''}
                      onChange={(e) => {
                        setSelectedStationId(e.target.value || null)
                        const st = stations.find((s) => s.id === e.target.value)
                        setConnectorType(st?.connectorTypes?.[0] ?? '')
                      }}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: 6,
                        border: '1px solid var(--border)',
                      }}
                    >
                      <option value="">{t('evCharging.selectStationPlaceholder')}</option>
                      {stations.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} — {s.powerKw} kW · {s.availableConnectors} {t('evCharging.available')}
                        </option>
                      ))}
                    </select>
                  </label>
                  {selectedStation && selectedStation.connectorTypes?.length > 0 && (
                    <label>
                      <span
                        style={{
                          display: 'block',
                          marginBottom: '0.25rem',
                          fontSize: '0.9rem',
                        }}
                      >
                        {t('evCharging.connectorType')}
                      </span>
                      <select
                        value={connectorType || selectedStation.connectorTypes[0]}
                        onChange={(e) => setConnectorType(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: 6,
                          border: '1px solid var(--border)',
                        }}
                      >
                        {selectedStation.connectorTypes.map((ct) => (
                          <option key={ct} value={ct}>
                            {ct}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <label>
                    <span
                      style={{
                        display: 'block',
                        marginBottom: '0.25rem',
                        fontSize: '0.9rem',
                      }}
                    >
                      {t('evCharging.duration')}
                    </span>
                    <select
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: 6,
                        border: '1px solid var(--border)',
                      }}
                    >
                      {DURATION_OPTIONS.map((m) => (
                        <option key={m} value={m}>
                          {m} min
                        </option>
                      ))}
                    </select>
                  </label>
                  {selectedStation && (
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>
                      {t('evCharging.estimatedKwh')}: ~
                      {(
                        selectedStation.powerKw *
                        (durationMinutes / 60)
                      ).toFixed(1)}{' '}
                      kWh · {t('evCharging.estimatedCost')}: $
                      {(
                        selectedStation.powerKw *
                        (durationMinutes / 60) *
                        selectedStation.pricePerKwh
                      ).toFixed(2)}
                    </p>
                  )}
                  {bookingError && (
                    <p style={{ color: 'var(--danger)', margin: 0, fontSize: '0.9rem' }}>
                      {bookingError}
                    </p>
                  )}
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={bookingInProgress || !selectedStationId}
                  >
                    {bookingInProgress ? t('evCharging.booking') : t('evCharging.bookButton')}
                  </button>
                </form>
              </section>
            )}

            <section className="card ev-card">
              <h3>{t('evCharging.availableStations')}</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {stations.map((st: EVChargingStationItem) => (
                  <li key={st.id} className="ev-station-item">
                    <p style={{ margin: '0.25rem 0', fontWeight: 600 }}>{st.name}</p>
                    <p
                      style={{
                        margin: '0.25rem 0',
                        fontSize: '0.9rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {st.address}
                    </p>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                      {t('evCharging.power')}: {st.powerKw} kW · {st.connectorTypes?.join(', ')} ·{' '}
                      <strong>
                        {st.availableConnectors}/{st.totalConnectors}
                      </strong>{' '}
                      {t('evCharging.available')} · ${st.pricePerKwh}/kWh · {String(st.distanceKm)} km
                    </p>
                    <a
                      href={`https://www.google.com/maps?q=${st.lat},${st.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.85rem', color: 'var(--accent)' }}
                    >
                      {t('evCharging.directions')}
                    </a>
                  </li>
                ))}
              </ul>
              {stations.length === 0 && (
                <p style={{ color: 'var(--text-secondary)' }}>{t('evCharging.noStations')}</p>
              )}
            </section>
          </>
        )}

        {!evData && !loading && (
          <p style={{ color: 'var(--danger)' }}>{error ?? 'Unable to load EV charging data'}</p>
        )}
      </div>
    </DriverScreen>
  )
}
