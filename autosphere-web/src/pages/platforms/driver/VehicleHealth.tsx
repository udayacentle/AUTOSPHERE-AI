import DriverScreen from './DriverScreen'
import { api, type VehicleHealthData, type VehicleHealthComponentDetail } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import './VehicleHealth.css'

const DEFAULT_HEALTH = { engine: 0, battery: 0, brakesTires: 0, fluids: 0, electrical: 0 }

function getStatusKey(status: string): 'good' | 'fair' | 'attention' {
  if (status === 'good' || status === 'fair' || status === 'attention') return status
  return 'good'
}

function formatUpdated(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return iso
  }
}

export default function VehicleHealth() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<VehicleHealthData>(() => api.getVehicleHealth())

  if (loading) {
    return (
      <DriverScreen title={t('vehicleHealth.title')} subtitle={t('vehicleHealth.subtitle')}>
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </DriverScreen>
    )
  }
  if (error) {
    return (
      <DriverScreen title={t('vehicleHealth.title')} subtitle={t('vehicleHealth.subtitle')}>
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>
          {t('common.refresh')}
        </button>
      </DriverScreen>
    )
  }

  const health = data?.health ?? DEFAULT_HEALTH
  const vehicle = data?.vehicle
  const componentDetails = data?.componentDetails ?? [
    { key: 'engine', score: health.engine, status: 'good' as const, message: '', label: t('vehicleHealth.engine'), sublabel: t('vehicleHealth.engineSublabel') },
    { key: 'battery', score: health.battery, status: 'good' as const, message: '', label: t('vehicleHealth.battery'), sublabel: t('vehicleHealth.batterySublabel') },
    { key: 'brakesTires', score: health.brakesTires, status: 'good' as const, message: '', label: t('vehicleHealth.brakesTires'), sublabel: t('vehicleHealth.brakesTiresSublabel') },
    { key: 'fluids', score: health.fluids, status: 'good' as const, message: '', label: t('vehicleHealth.fluids'), sublabel: t('vehicleHealth.fluidsSublabel') },
    { key: 'electrical', score: health.electrical, status: 'good' as const, message: '', label: t('vehicleHealth.electrical'), sublabel: t('vehicleHealth.electricalSublabel') },
  ]
  const recommendations = data?.recommendations ?? []
  const alerts = data?.alerts ?? []
  const lastUpdated = data?.lastUpdated
  const overallScore = vehicle?.healthScore ?? Math.round(
    (health.engine + health.battery + health.brakesTires + health.fluids + health.electrical) / 5
  )
  const vehicleLabel = vehicle ? `${vehicle.make} ${vehicle.model}` : '—'

  return (
    <DriverScreen title={t('vehicleHealth.title')} subtitle={t('vehicleHealth.subtitle')}>
      <div className="vehicle-health-page">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button type="button" className="btn-refresh" onClick={() => refetch()}>
            {t('common.refresh')}
          </button>
        </div>

        <section className="card vehicle-health-hero">
          <div className="vehicle-health-overall-circle">{overallScore}</div>
          <div className="vehicle-health-hero-text">
            <h2>{vehicleLabel}</h2>
            <p>{t('vehicleHealth.overallDesc')}</p>
          </div>
        </section>

        <section className="card vehicle-health-breakdown">
          <h3>{t('vehicleHealth.breakdownTitle')}</h3>
          {componentDetails.map((c: VehicleHealthComponentDetail) => {
            const statusKey = getStatusKey(c.status)
            return (
              <div key={c.key} className="vehicle-health-row">
                <div className="vehicle-health-row-label">
                  <strong>{c.label}</strong>
                  <span>{c.sublabel}</span>
                </div>
                <div className="vehicle-health-bar-wrap">
                  <div
                    className={`vehicle-health-bar vehicle-health-bar--${statusKey}`}
                    style={{ width: `${Math.min(100, c.score)}%` }}
                  />
                </div>
                <div className="vehicle-health-row-value">{c.score}%</div>
                <div className={`vehicle-health-row-status vehicle-health-row-status--${statusKey}`}>
                  {t(`vehicleHealth.status.${statusKey}`)}
                </div>
              </div>
            )
          })}
        </section>

        {alerts.length > 0 && (
          <section className="vehicle-health-alerts">
            <h3>{t('vehicleHealth.alerts')}</h3>
            <ul>
              {alerts.map((a) => (
                <li key={a.id}>
                  {a.component}: {a.score}% — {t('vehicleHealth.scheduleService')}
                </li>
              ))}
            </ul>
          </section>
        )}

        {recommendations.length > 0 && (
          <section className="card vehicle-health-recommendations">
            <h3>{t('vehicleHealth.recommendations')}</h3>
            <ul>
              {recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </section>
        )}

        {lastUpdated && (
          <p className="vehicle-health-updated">
            {t('vehicleHealth.lastUpdated')}: {formatUpdated(lastUpdated)}
          </p>
        )}
      </div>
    </DriverScreen>
  )
}
