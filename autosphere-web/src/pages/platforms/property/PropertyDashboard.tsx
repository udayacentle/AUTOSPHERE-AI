import PropertyScreen from './PropertyScreen'
import './PropertySections.css'
import { api, type PropertyParkingStatsData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_PARKING_STATS } from './propertyFallbacks'

export default function PropertyDashboard() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<PropertyParkingStatsData | null>(() =>
    api.getPropertyParkingStats()
  )
  const stats = data ?? (error ? FALLBACK_PARKING_STATS : null)

  const avgUtil = stats?.utilization?.length
    ? Math.round(stats.utilization.reduce((a, b) => a + b, 0) / stats.utilization.length)
    : 0
  const lastRevenue = stats?.revenue?.length ? stats.revenue[stats.revenue.length - 1] : 0

  if (loading && !stats) {
    return (
      <PropertyScreen title="Property Dashboard" subtitle="Overview of parking, EV charging, and revenue">
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </PropertyScreen>
    )
  }

  return (
    <PropertyScreen title="Property Dashboard" subtitle="Overview of parking, EV charging, and revenue (real API)">
      {error && (
        <div className="property-offline-banner">
          <span>Showing sample data. Start backend in <code>autosphere_full_production_monorepo/services/backend</code> for live data.</span>
          <button type="button" className="btn-refresh" onClick={() => refetch()}>Retry</button>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
      {stats && (
        <div className="card-grid">
          <div className="card">
            <h3>Total slots</h3>
            <p><strong>{stats.totalSlots}</strong></p>
          </div>
          <div className="card">
            <h3>Avg utilization</h3>
            <p><strong>{avgUtil}%</strong></p>
          </div>
          <div className="card">
            <h3>Revenue (last month)</h3>
            <p><strong>{stats.currency} {lastRevenue}</strong></p>
          </div>
          <div className="card">
            <h3>By month</h3>
            <p style={{ fontSize: '0.9rem' }}>
              {(stats.months ?? []).map((m, i) => `${m}: ${stats.utilization?.[i] ?? 0}%`).join(' · ')}
            </p>
          </div>
          {stats.zones?.length ? (
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <h3>Zones</h3>
              <div className="property-table-wrap">
                <table className="property-table">
                  <thead>
                    <tr><th>Zone</th><th>Name</th><th>Slots</th><th>Occupied</th><th>Util %</th></tr>
                  </thead>
                  <tbody>
                    {stats.zones.map((z) => (
                      <tr key={z.id}>
                        <td>{z.id}</td>
                        <td>{z.name}</td>
                        <td>{z.slots}</td>
                        <td>{z.occupied}</td>
                        <td>{z.slots ? Math.round((z.occupied / z.slots) * 100) : 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </PropertyScreen>
  )
}
