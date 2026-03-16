import DriverScreen from './DriverScreen'
import {
  api,
  type PredictiveMaintenanceData,
  type PredictiveMaintenanceAlertItem,
  type PredictiveMaintenanceUpcomingService,
} from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import './PredictiveMaintenance.css'

const FALLBACK_DATA: PredictiveMaintenanceData = {
  vehicle: { make: 'Toyota', model: 'Camry 2024', healthScore: 87 },
  alerts: [
    { id: 'pm-1', type: 'oil_change', component: 'Engine', title: 'Oil change due', description: 'Based on mileage and driving conditions, oil change recommended within 30 days or 1,200 km.', severity: 'high', dueDate: '2025-04-20', dueKm: 24000, status: 'pending', predictedDate: '2025-04-15' },
    { id: 'pm-2', type: 'brake_inspection', component: 'Brakes', title: 'Brake pad wear', description: 'Front brake pads at ~65% life. Schedule inspection at next service.', severity: 'medium', dueDate: '2025-05-01', dueKm: 26000, status: 'pending', predictedDate: '2025-04-28' },
  ],
  upcomingServices: [
    { date: '2025-04-20', type: 'Oil Change', description: 'Scheduled oil change and filter replacement.', status: 'scheduled' },
  ],
  summary: { totalAlerts: 2, criticalCount: 1, warningCount: 1 },
  lastUpdated: new Date().toISOString(),
}

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString(undefined, { dateStyle: 'medium' })
  } catch {
    return d
  }
}

function severityKey(s: string): 'high' | 'medium' | 'low' {
  if (s === 'high' || s === 'medium' || s === 'low') return s
  return 'low'
}

export default function PredictiveMaintenance() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<PredictiveMaintenanceData | null>(() =>
    api.getDriverPredictiveMaintenance()
  )
  const pm = data ?? (error ? FALLBACK_DATA : null)

  if (loading) {
    return (
      <DriverScreen title={t('predictiveMaintenance.title')} subtitle={t('predictiveMaintenance.subtitle')}>
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </DriverScreen>
    )
  }
  if (!pm) {
    return (
      <DriverScreen title={t('predictiveMaintenance.title')} subtitle={t('predictiveMaintenance.subtitle')}>
        <p style={{ color: 'var(--danger)' }}>{error ?? t('predictiveMaintenance.unableToLoad')}</p>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>
          {t('common.refresh')}
        </button>
      </DriverScreen>
    )
  }

  const { vehicle, alerts, upcomingServices, summary, lastUpdated } = pm

  return (
    <DriverScreen title={t('predictiveMaintenance.title')} subtitle={t('predictiveMaintenance.subtitle')}>
      <div className="predictive-maintenance-page">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button type="button" className="btn-refresh" onClick={() => refetch()}>
            {t('common.refresh')}
          </button>
        </div>

        <div className="predictive-maintenance-vehicle">
          <strong>{vehicle.make} {vehicle.model}</strong>
          {t('predictiveMaintenance.vehicleHealth')}: {vehicle.healthScore}%
        </div>

        <section className="predictive-maintenance-summary">
          <div className="predictive-maintenance-summary-card">
            <h3>{t('predictiveMaintenance.totalAlerts')}</h3>
            <div className="value">{summary.totalAlerts}</div>
          </div>
          <div className="predictive-maintenance-summary-card predictive-maintenance-summary-card--critical">
            <h3>{t('predictiveMaintenance.critical')}</h3>
            <div className="value">{summary.criticalCount}</div>
          </div>
          <div className="predictive-maintenance-summary-card predictive-maintenance-summary-card--warning">
            <h3>{t('predictiveMaintenance.warning')}</h3>
            <div className="value">{summary.warningCount}</div>
          </div>
        </section>

        <section className="card predictive-maintenance-alerts">
          <h3>{t('predictiveMaintenance.alertsTitle')}</h3>
          {alerts.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('predictiveMaintenance.noAlerts')}</p>
          ) : (
            alerts.map((alert: PredictiveMaintenanceAlertItem) => {
              const sev = severityKey(alert.severity)
              return (
                <div
                  key={alert.id}
                  className={`predictive-maintenance-alert predictive-maintenance-alert--${sev}`}
                >
                  <div className="predictive-maintenance-alert-header">
                    <span className="predictive-maintenance-alert-title">{alert.title}</span>
                    <span className={`predictive-maintenance-alert-badge predictive-maintenance-alert-badge--${sev}`}>
                      {t(`predictiveMaintenance.severity.${sev}`)}
                    </span>
                  </div>
                  <div className="predictive-maintenance-alert-meta">
                    {alert.component}
                    {alert.dueDate && ` · ${t('predictiveMaintenance.dueBy')} ${formatDate(alert.dueDate)}`}
                    {alert.dueKm != null && ` · ${alert.dueKm.toLocaleString()} km`}
                  </div>
                  <p className="predictive-maintenance-alert-desc">{alert.description}</p>
                </div>
              )
            })
          )}
        </section>

        <section className="card predictive-maintenance-upcoming">
          <h3>{t('predictiveMaintenance.upcomingServices')}</h3>
          {upcomingServices.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('predictiveMaintenance.noUpcoming')}</p>
          ) : (
            <ul className="predictive-maintenance-upcoming-list">
              {upcomingServices.map((svc: PredictiveMaintenanceUpcomingService, i: number) => (
                <li key={i}>
                  <strong>{svc.type}</strong> — {formatDate(svc.date)}
                  <br />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{svc.description}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          {t('predictiveMaintenance.bookService')}
        </p>

        <p className="predictive-maintenance-updated">
          {t('predictiveMaintenance.lastUpdated')}: {formatDate(lastUpdated)}
        </p>
      </div>
    </DriverScreen>
  )
}
