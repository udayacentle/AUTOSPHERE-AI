import AnalyticsScreen from './AnalyticsScreen'
import { api, type EmissionsAnalyticsData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'

export default function EmissionAnalytics() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<EmissionsAnalyticsData>(() => api.getAnalyticsEmissions())

  if (loading) {
    return (
      <AnalyticsScreen title="Emission Analytics" subtitle="Aggregate emission and environmental metrics">
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </AnalyticsScreen>
    )
  }
  if (error) {
    return (
      <AnalyticsScreen title="Emission Analytics" subtitle="Aggregate emission and environmental metrics">
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>
          {t('common.refresh')}
        </button>
      </AnalyticsScreen>
    )
  }

  return (
    <AnalyticsScreen
      title="Emission Analytics"
      subtitle={`Real-world CO₂ from trip data · ${data?.period ?? 'Current period'}`}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>
          {t('common.refresh')}
        </button>
      </div>
      <div className="card-grid">
        <div className="card">
          <h3>Total CO₂</h3>
          <p>{data?.totalKgCO2 ?? 0} kg CO₂</p>
          {data?.totalDistanceKm != null && (
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              From {data.totalDistanceKm} km total distance
            </p>
          )}
        </div>
        <div className="card">
          <h3>By fuel type</h3>
          <p>Petrol: {data?.petrolKgCO2 ?? 0} kg</p>
          <p>Diesel: {data?.dieselKgCO2 ?? 0} kg</p>
          <p>Electric: {data?.electricKgCO2 ?? 0} kg</p>
        </div>
        <div className="card">
          <h3>By segment</h3>
          <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
            {(data?.bySegment ?? []).map((s) => (
              <li key={s.segment}>
                {s.segment}: {s.kgCO2} kg CO₂
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AnalyticsScreen>
  )
}
