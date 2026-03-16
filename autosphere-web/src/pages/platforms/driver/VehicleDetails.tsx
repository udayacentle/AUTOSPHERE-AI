import DriverScreen from './DriverScreen'
import {
  api,
  type VehicleDetailsData,
  type VehicleDetailsLiveSnapshot,
  type VehicleDocumentItem,
  type RecallItem,
} from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import './VehicleDetails.css'

const FALLBACK_DATA: VehicleDetailsData = {
  vehicle: { id: 'v1', make: 'Toyota', model: 'Camry 2024', healthScore: 87, year: 2024, vin: '4T1BF1FK5NU123456' },
  specs: {
    year: 2024,
    fuelType: 'Gasoline',
    engine: '2.5L 4-cylinder',
    transmission: '8-Speed Automatic',
    drivetrain: 'FWD',
    bodyType: 'Sedan',
    vin: '4T1BF1FK5NU123456',
  },
  health: { engine: 90, battery: 85, brakesTires: 88, fluids: 82, electrical: 92 },
  liveSnapshot: {
    odometerKm: 18420,
    fuelLevelPercent: 72,
    tirePressureStatus: 'normal',
    lastServiceDate: '2025-01-15',
    nextServiceDueKm: 24000,
    lastUpdated: new Date().toISOString(),
  },
  documents: [
    { type: 'registration', name: 'Vehicle Registration (RC)', expiryDate: '2026-03-31', status: 'valid' },
    { type: 'insurance', name: 'Insurance Certificate', expiryDate: '2025-09-15', status: 'valid' },
    { type: 'puc', name: 'PUC / Emission Certificate', expiryDate: '2025-06-30', status: 'valid' },
  ],
  recalls: [],
  alerts: [],
}

function healthBarClass(value: number): string {
  if (value >= 80) return 'vehicle-details-health-bar--good'
  if (value >= 60) return 'vehicle-details-health-bar--warn'
  return 'vehicle-details-health-bar--low'
}

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString(undefined, { dateStyle: 'short' })
  } catch {
    return d
  }
}

export default function VehicleDetails() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<VehicleDetailsData | null>(() =>
    api.getDriverVehicleDetails()
  )
  const details = data ?? (error ? FALLBACK_DATA : null)

  if (loading) {
    return (
      <DriverScreen title={t('vehicleDetails.title')} subtitle={t('vehicleDetails.subtitle')}>
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </DriverScreen>
    )
  }
  if (!details) {
    return (
      <DriverScreen title={t('vehicleDetails.title')} subtitle={t('vehicleDetails.subtitle')}>
        <p style={{ color: 'var(--danger)' }}>{error ?? t('vehicleDetails.unableToLoad')}</p>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>
          {t('common.refresh')}
        </button>
      </DriverScreen>
    )
  }

  const { vehicle, specs, health, liveSnapshot, documents, recalls, alerts } = details
  const vehicleLabel = vehicle
    ? `${vehicle.make} ${vehicle.model}${specs?.year ? ` (${specs.year})` : ''}`
    : '—'

  return (
    <DriverScreen title={t('vehicleDetails.title')} subtitle={t('vehicleDetails.subtitle')}>
      <div className="vehicle-details-page">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button type="button" className="btn-refresh" onClick={() => refetch()}>
            {t('common.refresh')}
          </button>
        </div>

        {error && (
          <p style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: 8 }}>
            {t('fleet.showingSampleData')}
          </p>
        )}

        {/* Digital twin: live snapshot */}
        <section className="card vehicle-details-twin">
          <div className="vehicle-details-twin-visual" aria-hidden>
            <span className="vehicle-details-car-emoji" role="img" aria-label="Car">🚗</span>
          </div>
          <div className="vehicle-details-twin-metrics">
            <div className="vehicle-details-twin-metric">
              <div className="vehicle-details-twin-metric-label">{t('vehicleDetails.odometer')}</div>
              <div className="vehicle-details-twin-metric-value">
                {liveSnapshot.odometerKm.toLocaleString()} km
              </div>
            </div>
            <div className="vehicle-details-twin-metric">
              <div className="vehicle-details-twin-metric-label">{t('vehicleDetails.fuel')}</div>
              <div className="vehicle-details-twin-metric-value">{liveSnapshot.fuelLevelPercent}%</div>
            </div>
            <div className="vehicle-details-twin-metric">
              <div className="vehicle-details-twin-metric-label">{t('vehicleDetails.tires')}</div>
              <div className="vehicle-details-twin-metric-value">
                {liveSnapshot.tirePressureStatus === 'normal'
                  ? t('vehicleDetails.normal')
                  : liveSnapshot.tirePressureStatus}
              </div>
            </div>
            <div className="vehicle-details-twin-metric">
              <div className="vehicle-details-twin-metric-label">{t('vehicleDetails.healthScore')}</div>
              <div className="vehicle-details-twin-metric-value">{vehicle?.healthScore ?? '—'}%</div>
            </div>
          </div>
        </section>

        {/* Vehicle identity */}
        <section className="card vehicle-details-identity">
          <h2>{vehicleLabel}</h2>
          {specs.vin && <p className="vin">VIN: {specs.vin}</p>}
        </section>

        {/* Specs */}
        <section className="card vehicle-details-section">
          <h3>{t('vehicleDetails.specs')}</h3>
          <div className="vehicle-details-specs-grid">
            <div className="vehicle-details-spec-item">
              <label>{t('vehicleDetails.fuelType')}</label>
              <span>{specs.fuelType}</span>
            </div>
            <div className="vehicle-details-spec-item">
              <label>{t('vehicleDetails.engine')}</label>
              <span>{specs.engine}</span>
            </div>
            <div className="vehicle-details-spec-item">
              <label>{t('vehicleDetails.transmission')}</label>
              <span>{specs.transmission}</span>
            </div>
            <div className="vehicle-details-spec-item">
              <label>{t('vehicleDetails.drivetrain')}</label>
              <span>{specs.drivetrain}</span>
            </div>
            {specs.bodyType && (
              <div className="vehicle-details-spec-item">
                <label>{t('vehicleDetails.bodyType')}</label>
                <span>{specs.bodyType}</span>
              </div>
            )}
          </div>
        </section>

        {/* Health breakdown */}
        <section className="card vehicle-details-section">
          <h3>{t('vehicleDetails.healthBreakdown')}</h3>
          <div className="vehicle-details-health-bars">
            {(['engine', 'battery', 'brakesTires', 'fluids', 'electrical'] as const).map((key) => {
              const value = health[key] ?? 0
              const label =
                key === 'brakesTires'
                  ? t('vehicleDetails.brakesTires')
                  : t(`vehicleDetails.${key}` as 'vehicleDetails.engine')
              return (
                <div key={key} className="vehicle-details-health-row">
                  <span className="vehicle-details-health-label">{label}</span>
                  <div className="vehicle-details-health-bar-wrap">
                    <div
                      className={`vehicle-details-health-bar ${healthBarClass(value)}`}
                      style={{ width: `${Math.min(100, value)}%` }}
                    />
                  </div>
                  <span className="vehicle-details-health-value">{value}</span>
                </div>
              )
            })}
          </div>
        </section>

        {/* Service info from live snapshot */}
        <section className="card vehicle-details-section">
          <h3>{t('vehicleDetails.service')}</h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            {t('vehicleDetails.lastService')}: {formatDate(liveSnapshot.lastServiceDate)}
          </p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem' }}>
            {t('vehicleDetails.nextServiceDue')}: {liveSnapshot.nextServiceDueKm.toLocaleString()} km
          </p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {t('vehicleDetails.lastUpdated')}: {formatDate(liveSnapshot.lastUpdated)}
          </p>
        </section>

        {/* Documents */}
        <section className="card vehicle-details-section">
          <h3>{t('vehicleDetails.documents')}</h3>
          <ul className="vehicle-details-docs-list">
            {documents.map((doc: VehicleDocumentItem) => (
              <li key={doc.type}>
                {doc.name} — {t('vehicleDetails.expires')} {formatDate(doc.expiryDate)}
                <span
                  className={`vehicle-details-doc-status vehicle-details-doc-status--${
                    doc.status === 'valid' ? 'valid' : 'expired'
                  }`}
                >
                  {doc.status}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* NHTSA Recalls */}
        <section className="card vehicle-details-section">
          <h3>{t('vehicleDetails.recalls')}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            {t('vehicleDetails.recallsSource')}
          </p>
          {recalls.length === 0 ? (
            <p className="vehicle-details-no-recalls">{t('vehicleDetails.noRecalls')}</p>
          ) : (
            <ul className="vehicle-details-recalls-list">
              {recalls.slice(0, 8).map((r: RecallItem, i: number) => (
                <li key={i} className="vehicle-details-recall-item">
                  <strong>{r.Component}</strong>
                  <span className="summary">{r.Summary || '—'}</span>
                  {r.Consequence && (
                    <span style={{ display: 'block', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                      {r.Consequence}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {alerts.length > 0 && (
          <section className="vehicle-details-alerts">
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{t('vehicleDetails.alerts')}</h3>
            <ul>
              {alerts.map((a) => (
                <li key={a.id}>{a.message}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </DriverScreen>
  )
}
