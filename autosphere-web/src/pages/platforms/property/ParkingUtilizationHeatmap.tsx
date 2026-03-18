import PropertyScreen from './PropertyScreen'
import './PropertySections.css'
import { api, type PropertyParkingStatsData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_PARKING_STATS } from './propertyFallbacks'

export default function ParkingUtilizationHeatmap() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<PropertyParkingStatsData | null>(() =>
    api.getPropertyParkingStats()
  )
  const stats = data ?? (error ? FALLBACK_PARKING_STATS : null)
  const months = stats?.months ?? []
  const utilization = stats?.utilization ?? []

  if (loading && !stats) {
    return (
      <PropertyScreen title="Parking Utilization Heatmap" subtitle="Visualize occupancy by zone and time">
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </PropertyScreen>
    )
  }

  return (
    <PropertyScreen title="Parking Utilization Heatmap" subtitle="Utilization % by month (real API)">
      {error && (
        <div className="property-offline-banner">
          <span>Showing sample data. Start backend for live data.</span>
          <button type="button" className="btn-refresh" onClick={() => refetch()}>Retry</button>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
      {stats && (
        <>
          <div className="card-grid">
            {months.map((month, i) => (
              <div
                key={month}
                className="card"
                style={{
                  borderLeftWidth: '4px',
                  borderLeftColor: (utilization[i] ?? 0) >= 85 ? 'var(--danger)' : (utilization[i] ?? 0) >= 70 ? 'var(--warning)' : 'var(--success)',
                }}
              >
                <h3>{month}</h3>
                <p><strong>{utilization[i] ?? 0}%</strong> utilization</p>
              </div>
            ))}
          </div>
          {stats.zones?.length ? (
            <section className="card" style={{ marginTop: '1rem' }}>
              <h3>By zone</h3>
              <div className="property-table-wrap">
                <table className="property-table">
                  <thead>
                    <tr><th>Zone</th><th>Name</th><th>Occupied / Total</th><th>Util %</th></tr>
                  </thead>
                  <tbody>
                    {stats.zones.map((z) => (
                      <tr key={z.id}>
                        <td>{z.id}</td>
                        <td>{z.name}</td>
                        <td>{z.occupied} / {z.slots}</td>
                        <td>{z.slots ? Math.round((z.occupied / z.slots) * 100) : 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </>
      )}
    </PropertyScreen>
  )
}
