import DriverScreen from './DriverScreen'
import { api, type MobilityScoreData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import './MobilityScore.css'

export default function MobilityScore() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<MobilityScoreData>(() => api.getMobilityScore())

  if (loading) {
    return (
      <DriverScreen
        title={t('mobility.title')}
        subtitle={t('mobility.subtitle')}
      >
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </DriverScreen>
    )
  }
  if (error) {
    return (
      <DriverScreen title={t('mobility.title')} subtitle={t('mobility.subtitle')}>
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>
          {t('common.refresh')}
        </button>
      </DriverScreen>
    )
  }

  const score = data ?? {
    overall: 0,
    drivingBehavior: 0,
    vehicleCondition: 0,
    usagePatterns: 0,
  }
  const hasData =
    score.overall > 0 ||
    score.drivingBehavior > 0 ||
    score.vehicleCondition > 0 ||
    score.usagePatterns > 0
  const trend = score.trend ?? 'stable'
  const recommendations = score.recommendations ?? []
  const breakdown = score.breakdown ?? []
  const updatedAt = score.updatedAt
    ? new Date(score.updatedAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
    : null

  return (
    <DriverScreen title={t('mobility.title')} subtitle={t('mobility.subtitle')}>
      <div className="mobility-score-page">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button type="button" className="btn-refresh" onClick={() => refetch()}>
            {t('common.refresh')}
          </button>
        </div>

        {!hasData && (
          <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {t('mobility.noData')}
          </p>
        )}

        {hasData && (
          <>
            <div className="mobility-score-hero">
              <div
                className="mobility-score-circle"
                style={{ ['--score-pct' as string]: score.overall } as React.CSSProperties}
              >
                <div className="mobility-score-circle-inner">{score.overall}</div>
              </div>
              <div className="mobility-score-hero-text">
                <h2>{t('mobility.overallScore')}</h2>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {t('mobility.overallDesc')}
                </p>
                {(trend === 'up' || trend === 'down' || trend === 'stable') && (
                  <span
                    className={`mobility-score-trend mobility-score-trend--${trend}`}
                    title={
                      score.previousOverall != null
                        ? `${t('mobility.previous')}: ${score.previousOverall}`
                        : undefined
                    }
                  >
                    {trend === 'up' && '↑ '}
                    {trend === 'down' && '↓ '}
                    {t(`mobility.trend.${trend}`)}
                  </span>
                )}
              </div>
            </div>

            <div className="mobility-cards-grid">
              <div className="mobility-card">
                <h3>{t('mobility.drivingBehavior')}</h3>
                <div className="mobility-card-value">{score.drivingBehavior} / 100</div>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {t('mobility.drivingBehaviorDesc')}
                </p>
              </div>
              <div className="mobility-card">
                <h3>{t('mobility.vehicleCondition')}</h3>
                <div className="mobility-card-value">{score.vehicleCondition} / 100</div>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {t('mobility.vehicleConditionDesc')}
                </p>
              </div>
              <div className="mobility-card">
                <h3>{t('mobility.usagePatterns')}</h3>
                <div className="mobility-card-value">{score.usagePatterns} / 100</div>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {t('mobility.usagePatternsDesc')}
                </p>
              </div>
            </div>

            {breakdown.length > 0 && (
              <section className="card mobility-score-breakdown">
                <h3>{t('mobility.breakdownTitle')}</h3>
                {breakdown.map((item, i) => (
                  <div key={i} className="mobility-breakdown-item">
                    <span className="mobility-breakdown-label">{item.label}</span>
                    <div className="mobility-breakdown-bar-wrap">
                      <div
                        className="mobility-breakdown-bar"
                        style={{ width: `${Math.min(100, item.score)}%` }}
                      />
                    </div>
                    <span className="mobility-breakdown-value">{item.score}</span>
                  </div>
                ))}
              </section>
            )}

            {recommendations.length > 0 && (
              <section className="card">
                <h3>{t('mobility.recommendations')}</h3>
                <ul className="mobility-recommendations">
                  {recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </section>
            )}

            {updatedAt && (
              <p className="mobility-score-updated">
                {t('mobility.lastUpdated')}: {updatedAt}
              </p>
            )}
          </>
        )}
      </div>
    </DriverScreen>
  )
}
