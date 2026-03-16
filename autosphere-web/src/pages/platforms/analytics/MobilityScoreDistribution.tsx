import AnalyticsScreen from './AnalyticsScreen'
import { api, type MobilityDistributionData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'

export default function MobilityScoreDistribution() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<MobilityDistributionData>(() =>
    api.getAnalyticsMobilityDistribution()
  )

  if (loading) {
    return (
      <AnalyticsScreen
        title="Mobility Score Distribution"
        subtitle="Distribution of mobility scores across drivers and fleet"
      >
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </AnalyticsScreen>
    )
  }
  if (error) {
    return (
      <AnalyticsScreen
        title="Mobility Score Distribution"
        subtitle="Distribution of mobility scores across drivers and fleet"
      >
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>
          {t('common.refresh')}
        </button>
      </AnalyticsScreen>
    )
  }

  return (
    <AnalyticsScreen
      title="Mobility Score Distribution"
      subtitle={`Real data from backend · Average: ${data?.average ?? 0}`}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>
          {t('common.refresh')}
        </button>
      </div>
      <div className="card-grid">
        <div className="card">
          <h3>Average score</h3>
          <p>{data?.average ?? 0} / 100</p>
        </div>
        {(data?.buckets ?? []).map((b) => (
          <div key={b.range} className="card">
            <h3>Score {b.range}</h3>
            <p>{b.count} driver(s)</p>
          </div>
        ))}
      </div>
    </AnalyticsScreen>
  )
}
