import { Link } from 'react-router-dom'
import { useI18n } from '../../../i18n/context'
import { api, type FleetDashboardData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import FleetScreen from './FleetScreen'
import './FleetDashboard.css'

const FLEET_QUICK_ACCESS = [
  { path: 'organizations', titleKey: 'screens.fleet.organizations' },
  { path: 'roles', titleKey: 'screens.fleet.roles' },
  { path: 'trips', titleKey: 'screens.fleet.trips' },
  { path: 'users', titleKey: 'screens.fleet.users' },
]

export default function FleetDashboard() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<FleetDashboardData>(() => api.getFleetDashboard())

  if (loading) {
    return (
      <FleetScreen title={t('fleet.dashboardTitle')} subtitle={t('fleet.dashboardSubtitle')}>
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </FleetScreen>
    )
  }
  if (error) {
    return (
      <FleetScreen title={t('fleet.dashboardTitle')} subtitle={t('fleet.dashboardSubtitle')}>
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </FleetScreen>
    )
  }

  const d = data ?? { trips: 0, fuel: 0, maintenance: 0 }
  const max = Math.max(d.trips, d.fuel, d.maintenance, 1)

  return (
    <FleetScreen title={t('fleet.dashboardTitle')} subtitle={t('fleet.dashboardSubtitle')}>
      <section className="fleet-dashboard-sections card fleet-dashboard-quick-access-top">
        <h3>{t('fleet.quickAccess')}</h3>
        <div className="fleet-dashboard-links">
          {FLEET_QUICK_ACCESS.map((item) => (
            <Link
              key={item.path}
              to={`/app/fleet/${item.path}`}
              className="fleet-dashboard-link-card"
            >
              <span className="fleet-dashboard-link-title">{t(item.titleKey)}</span>
            </Link>
          ))}
        </div>
      </section>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
      <div className="fleet-stats">
        <div className="card">
          <h3>{t('fleet.trips')}</h3>
          <p className="fleet-stat-value">{d.trips}</p>
        </div>
        <div className="card">
          <h3>{t('fleet.fuel')}</h3>
          <p className="fleet-stat-value">{d.fuel}</p>
        </div>
        <div className="card">
          <h3>{t('fleet.maintenance')}</h3>
          <p className="fleet-stat-value">{d.maintenance}</p>
        </div>
      </div>
      <div className="fleet-chart-card card">
        <h3>{t('fleet.fleetAnalytics')}</h3>
        <div className="fleet-bar-chart" role="img" aria-label={t('fleet.fleetAnalytics')}>
          <div className="fleet-bar-row">
            <span className="fleet-bar-label">{t('fleet.trips')}</span>
            <div className="fleet-bar-track">
              <div className="fleet-bar-fill" style={{ width: `${(d.trips / max) * 100}%` }} />
            </div>
            <span className="fleet-bar-value">{d.trips}</span>
          </div>
          <div className="fleet-bar-row">
            <span className="fleet-bar-label">{t('fleet.fuel')}</span>
            <div className="fleet-bar-track">
              <div className="fleet-bar-fill" style={{ width: `${(d.fuel / max) * 100}%` }} />
            </div>
            <span className="fleet-bar-value">{d.fuel}</span>
          </div>
          <div className="fleet-bar-row">
            <span className="fleet-bar-label">{t('fleet.maintenance')}</span>
            <div className="fleet-bar-track">
              <div className="fleet-bar-fill" style={{ width: `${(d.maintenance / max) * 100}%` }} />
            </div>
            <span className="fleet-bar-value">{d.maintenance}</span>
          </div>
        </div>
      </div>
    </FleetScreen>
  )
}
