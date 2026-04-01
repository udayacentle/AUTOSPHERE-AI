import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../../i18n/context'
import { api, type FleetDashboardData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import FleetScreen from './FleetScreen'
import './FleetDashboard.css'

/** Quick access tiles: path matches `/app/fleet/:path`; counts load from real fleet APIs. */
const FLEET_QUICK_ACCESS: { path: string; titleKey: string }[] = [
  { path: 'organizations', titleKey: 'screens.fleet.organizations' },
  { path: 'roles', titleKey: 'screens.fleet.roles' },
  { path: 'trips', titleKey: 'screens.fleet.trips' },
  { path: 'users', titleKey: 'screens.fleet.users' },
  { path: 'vehicles', titleKey: 'screens.fleet.vehicles' },
  { path: 'maintenance', titleKey: 'screens.fleet.maintenance' },
  { path: 'alerts', titleKey: 'screens.fleet.alerts' },
  { path: 'fuel-management', titleKey: 'screens.fleet.fuelManagement' },
]

export default function FleetDashboard() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<FleetDashboardData>(() => api.getFleetDashboard())

  const [qaCounts, setQaCounts] = useState<Record<string, number | null>>({})
  const [qaLoading, setQaLoading] = useState(true)

  const loadQuickAccessCounts = useCallback(async () => {
    setQaLoading(true)
    try {
      const [
        orgs,
        roles,
        trips,
        users,
        vehicles,
        maintenance,
        alertsOpen,
        fuelLogs,
      ] = await Promise.all([
        api.getFleetOrganizations(),
        api.getFleetRoles(),
        api.getFleetTrips(500),
        api.getFleetUsers(),
        api.getFleetVehicles(),
        api.getFleetMaintenance(),
        api.getFleetAlerts('open', 200),
        api.getFleetFuelLogs(200),
      ])
      setQaCounts({
        organizations: orgs.length,
        roles: roles.length,
        trips: trips.length,
        users: users.length,
        vehicles: vehicles.length,
        maintenance: maintenance.length,
        alerts: alertsOpen.length,
        'fuel-management': fuelLogs.length,
      })
    } catch {
      setQaCounts({})
    } finally {
      setQaLoading(false)
    }
  }, [])

  useEffect(() => {
    loadQuickAccessCounts()
  }, [loadQuickAccessCounts])

  const refreshAll = useCallback(() => {
    refetch()
    loadQuickAccessCounts()
  }, [refetch, loadQuickAccessCounts])

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
        <button type="button" className="btn-refresh" onClick={() => refreshAll()}>
          {t('common.refresh')}
        </button>
      </FleetScreen>
    )
  }

  const d = data ?? { trips: 0, fuel: 0, maintenance: 0 }
  const max = Math.max(d.trips, d.fuel, d.maintenance, 1)

  return (
    <FleetScreen title={t('fleet.dashboardTitle')} subtitle={t('fleet.dashboardSubtitle')}>
      <section className="fleet-dashboard-sections card fleet-dashboard-quick-access-top">
        <div className="fleet-quick-access-header">
          <h3>{t('fleet.quickAccess')}</h3>
          <span className="fleet-quick-access-hint">{t('fleet.quickAccessLiveCounts')}</span>
        </div>
        <div className="fleet-dashboard-links">
          {FLEET_QUICK_ACCESS.map((item) => {
            const count = qaCounts[item.path]
            return (
              <Link
                key={item.path}
                to={`/app/fleet/${item.path}`}
                className="fleet-dashboard-link-card"
              >
                <span className="fleet-dashboard-link-title">{t(item.titleKey)}</span>
                <span className="fleet-dashboard-link-count" aria-label="count">
                  {qaLoading ? '…' : count != null ? count : '—'}
                </span>
              </Link>
            )
          })}
        </div>
      </section>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refreshAll()}>
          {t('common.refresh')}
        </button>
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
        {d.vehicleCount != null && (
          <div className="card">
            <h3>{t('fleet.vehiclesTitle')}</h3>
            <p className="fleet-stat-value">{d.vehicleCount}</p>
          </div>
        )}
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
