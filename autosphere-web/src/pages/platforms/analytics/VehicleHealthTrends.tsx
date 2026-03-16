import AnalyticsScreen from './AnalyticsScreen'
import { api, type AnalyticsTrendsData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'

export default function VehicleHealthTrends() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<AnalyticsTrendsData>(() =>
    api.getAnalyticsVehicleHealthTrends()
  )

  if (loading) {
    return (
      <AnalyticsScreen title="Vehicle Health Trends" subtitle="Aggregate vehicle health and maintenance trends">
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </AnalyticsScreen>
    )
  }
  if (error) {
    return (
      <AnalyticsScreen title="Vehicle Health Trends" subtitle="Aggregate vehicle health and maintenance trends">
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </AnalyticsScreen>
    )
  }

  const months = data?.months ?? []
  const avgHealth = data?.avgHealth ?? []

  return (
    <AnalyticsScreen title="Vehicle Health Trends" subtitle="From backend vehicle health data">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
      <div className="card-grid">
        {months.map((month, i) => (
          <div key={month} className="card">
            <h3>{month}</h3>
            <p>Avg health: <strong>{avgHealth[i] ?? '—'}</strong> / 100</p>
          </div>
        ))}
      </div>
    </AnalyticsScreen>
  )
}
