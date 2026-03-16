import { useState } from 'react'
import DriverScreen from './DriverScreen'
import {
  api,
  type DriverRoadsideData,
  type RoadsideServiceTypeItem,
  type RoadsideRequestItem,
} from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import './Roadside.css'

const FALLBACK_ROADSIDE: DriverRoadsideData = {
  serviceTypes: [
    { id: 'towing', name: 'Towing', description: 'Vehicle tow to nearest shop', estimatedMin: 45 },
    { id: 'battery', name: 'Battery jump-start', description: 'Jump-start or battery replacement', estimatedMin: 30 },
    { id: 'flat_tire', name: 'Flat tire', description: 'Tire change or repair', estimatedMin: 35 },
    { id: 'lockout', name: 'Lockout', description: 'Unlock vehicle', estimatedMin: 25 },
    { id: 'fuel', name: 'Fuel delivery', description: 'Emergency fuel delivery', estimatedMin: 40 },
  ],
  activeRequest: null,
  recentRequests: [],
  lastKnownLocation: { lat: 37.77, lng: -122.41, address: 'San Francisco, CA', updatedAt: new Date().toISOString() },
}

const SERVICE_TYPE_KEYS: Record<string, string> = {
  towing: 'towing',
  battery: 'battery',
  flat_tire: 'flatTire',
  lockout: 'lockout',
  fuel: 'fuel',
}

export default function Roadside() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<DriverRoadsideData | null>(() =>
    api.getDriverRoadside()
  )
  const roadsideData = data ?? (error ? FALLBACK_ROADSIDE : null)

  const [serviceType, setServiceType] = useState('')
  const [vehicleDescription, setVehicleDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [requesting, setRequesting] = useState(false)
  const [requestError, setRequestError] = useState('')
  const [cancelling, setCancelling] = useState(false)

  const serviceTypes = roadsideData?.serviceTypes ?? []
  const activeRequest = roadsideData?.activeRequest ?? null
  const recentRequests = roadsideData?.recentRequests ?? []
  const lastLocation = roadsideData?.lastKnownLocation

  const serviceTypeLabel = (id: string) => {
    const key = SERVICE_TYPE_KEYS[id]
    return key ? t(`roadside.${key}`) : id
  }

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setRequestError('')
    if (!serviceType) {
      setRequestError('Select a service type')
      return
    }
    setRequesting(true)
    try {
      const result = await api.requestRoadsideAssistance({
        serviceType,
        vehicleDescription: vehicleDescription || undefined,
        notes: notes || undefined,
      })
      if (result?.success) {
        setServiceType('')
        setVehicleDescription('')
        setNotes('')
        refetch()
      } else {
        setRequestError((result as { error?: string })?.error || 'Request failed')
      }
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setRequesting(false)
    }
  }

  const handleCancelRequest = async () => {
    setCancelling(true)
    setRequestError('')
    try {
      await api.cancelRoadsideRequest()
      refetch()
    } catch {
      setRequestError('Failed to cancel request')
    } finally {
      setCancelling(false)
    }
  }

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
    } catch {
      return iso
    }
  }

  if (loading) {
    return (
      <DriverScreen title="Roadside Assistance" subtitle="Request help on the road">
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </DriverScreen>
    )
  }

  return (
    <DriverScreen title="Roadside Assistance" subtitle="Request help on the road">
      <div className="roadside-page">
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

        {roadsideData && (
          <>
            {activeRequest ? (
              <section className="card roadside-card roadside-active">
                <h3>{t('roadside.activeRequest')}</h3>
                <p style={{ margin: '0.25rem 0', fontWeight: 600 }}>{activeRequest.serviceName}</p>
                <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {t('roadside.status')}: <strong>{activeRequest.status}</strong>
                </p>
                <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
                  {t('roadside.eta')}: ~{activeRequest.etaMinutes} {t('roadside.min')} — {formatTime(activeRequest.etaTime)}
                </p>
                {activeRequest.helperName && (
                  <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>{activeRequest.helperName}</p>
                )}
                {activeRequest.helperPhone && (
                  <a
                    href={`tel:${activeRequest.helperPhone.replace(/\s/g, '')}`}
                    className="roadside-call-helper"
                  >
                    {t('roadside.callHelper')} {activeRequest.helperPhone}
                  </a>
                )}
                <button
                  type="button"
                  className="btn-refresh"
                  style={{ marginTop: '0.75rem' }}
                  onClick={handleCancelRequest}
                  disabled={cancelling}
                >
                  {cancelling ? t('roadside.cancelling') : t('roadside.cancelRequest')}
                </button>
              </section>
            ) : (
              <section className="card roadside-card" style={{ marginBottom: '1.5rem' }}>
                <h3>{t('roadside.requestAssistance')}</h3>
                <form onSubmit={handleSubmitRequest} className="roadside-form">
                  <label>
                    <span className="roadside-label">{t('roadside.serviceType')}</span>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="roadside-select"
                      required
                    >
                      <option value="">{t('roadside.selectPlaceholder')}</option>
                      {serviceTypes.map((s: RoadsideServiceTypeItem) => (
                        <option key={s.id} value={s.id}>
                          {serviceTypeLabel(s.id)} — ~{s.estimatedMin} {t('roadside.min')}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="roadside-label">{t('roadside.vehicleDescription')}</span>
                    <input
                      type="text"
                      value={vehicleDescription}
                      onChange={(e) => setVehicleDescription(e.target.value)}
                      className="roadside-input"
                      placeholder="e.g. Blue sedan, license ABC 123"
                    />
                  </label>
                  <label>
                    <span className="roadside-label">{t('roadside.notes')}</span>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="roadside-textarea"
                      rows={2}
                      placeholder="Landmark, exit number, etc."
                    />
                  </label>
                  {requestError && (
                    <p style={{ color: 'var(--danger)', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
                      {requestError}
                    </p>
                  )}
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={requesting || !serviceType}
                  >
                    {requesting ? t('roadside.requesting') : t('roadside.submitRequest')}
                  </button>
                </form>
              </section>
            )}

            <section className="card roadside-card" style={{ marginBottom: '1.5rem' }}>
              <h3>{t('roadside.location')}</h3>
              <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {t('roadside.shareLocation')}
              </p>
              {lastLocation && (
                <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
                  {t('roadside.lastLocation')}: {lastLocation.address ?? `${lastLocation.lat}, ${lastLocation.lng}`}
                </p>
              )}
              <a
                href={`https://www.google.com/maps?q=${lastLocation?.lat ?? 37.77},${lastLocation?.lng ?? -122.41}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.9rem', color: 'var(--accent)' }}
              >
                Open in Maps
              </a>
            </section>

            <section className="card roadside-card">
              <h3>{t('roadside.recentRequests')}</h3>
              {recentRequests.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{t('roadside.noRecentRequests')}</p>
              ) : (
                <ul className="roadside-recent-list">
                  {recentRequests.map((req: RoadsideRequestItem) => (
                    <li key={req.id} className="roadside-recent-item">
                      <span className="roadside-recent-service">{req.serviceName}</span>
                      <span className="roadside-recent-time">{formatTime(req.requestedAt)}</span>
                      <span className="roadside-recent-status">{req.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        {!roadsideData && !loading && (
          <p style={{ color: 'var(--danger)' }}>{error ?? 'Unable to load roadside data'}</p>
        )}
      </div>
    </DriverScreen>
  )
}
