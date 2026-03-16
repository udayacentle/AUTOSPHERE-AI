import AnalyticsScreen from './AnalyticsScreen'
import { api, type ParkingRevenueData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'

export default function ParkingRevenueTrends() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<ParkingRevenueData>(() => api.getAnalyticsParkingRevenue())

  if (loading) {
    return (
      <AnalyticsScreen
        title="Parking Revenue Trends"
        subtitle="Parking and EV charging revenue across properties"
      >
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </AnalyticsScreen>
    )
  }
  if (error) {
    return (
      <AnalyticsScreen
        title="Parking Revenue Trends"
        subtitle="Parking and EV charging revenue across properties"
      >
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>
          {t('common.refresh')}
        </button>
      </AnalyticsScreen>
    )
  }

  const months = data?.months ?? []
  const revenue = data?.revenue ?? []
  const currency = data?.currency ?? 'USD'

  return (
    <AnalyticsScreen
      title="Parking Revenue Trends"
      subtitle={`Real-world revenue by month (${currency})`}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>
          {t('common.refresh')}
        </button>
      </div>
      <div className="card-grid">
        {months.map((month, i) => (
          <div key={month} className="card">
            <h3>{month}</h3>
            <p>
              {currency} {revenue[i] ?? 0}
            </p>
          </div>
        ))}
      </div>
    </AnalyticsScreen>
  )
}
