import PropertyScreen from './PropertyScreen'
import { api, type PropertyParkingStatsData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'

export default function ParkingUtilizationHeatmap() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<PropertyParkingStatsData>(() =>
    api.getPropertyParkingStats()
  )

  if (loading) {
    return (
      <PropertyScreen title="Parking Utilization Heatmap" subtitle="Visualize occupancy by zone and time">
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </PropertyScreen>
    )
  }
  if (error) {
    return (
      <PropertyScreen title="Parking Utilization Heatmap" subtitle="Visualize occupancy by zone and time">
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </PropertyScreen>
    )
  }

  const months = data?.months ?? []
  const utilization = data?.utilization ?? []

  return (
    <PropertyScreen title="Parking Utilization Heatmap" subtitle="Utilization % by month (API data)">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
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
      <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        Zone heatmap and time range filters (coming soon).
      </p>
    </PropertyScreen>
  )
}
