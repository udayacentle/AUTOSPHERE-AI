import PropertyScreen from './PropertyScreen'
import { api, type PropertyParkingStatsData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'

export default function PropertyDashboard() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<PropertyParkingStatsData>(() =>
    api.getPropertyParkingStats()
  )

  if (loading) {
    return (
      <PropertyScreen title="Property Dashboard" subtitle="Overview of parking, EV charging, and revenue">
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </PropertyScreen>
    )
  }
  if (error) {
    return (
      <PropertyScreen title="Property Dashboard" subtitle="Overview of parking, EV charging, and revenue">
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </PropertyScreen>
    )
  }

  const avgUtil = data?.utilization?.length
    ? Math.round(data.utilization.reduce((a, b) => a + b, 0) / data.utilization.length)
    : 0
  const lastRevenue = data?.revenue?.length ? data.revenue[data.revenue.length - 1] : 0

  return (
    <PropertyScreen title="Property Dashboard" subtitle="Real parking stats from API">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
      <div className="card-grid">
        <div className="card">
          <h3>Total slots</h3>
          <p><strong>{data?.totalSlots ?? 0}</strong></p>
        </div>
        <div className="card">
          <h3>Avg utilization</h3>
          <p><strong>{avgUtil}%</strong></p>
        </div>
        <div className="card">
          <h3>Revenue (last month)</h3>
          <p><strong>{data?.currency ?? 'USD'} {lastRevenue}</strong></p>
        </div>
        <div className="card">
          <h3>By month</h3>
          <p style={{ fontSize: '0.9rem' }}>
            {(data?.months ?? []).map((m, i) => `${m}: ${data?.utilization?.[i] ?? 0}%`).join(' · ')}
          </p>
        </div>
      </div>
    </PropertyScreen>
  )
}
