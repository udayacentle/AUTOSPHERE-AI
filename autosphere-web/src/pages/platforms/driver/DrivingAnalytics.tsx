import DriverScreen from './DriverScreen'
import { api, type DrivingAnalyticsData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'

const FALLBACK_ANALYTICS: DrivingAnalyticsData = {
  riskScore: 24,
  riskLevel: 'low',
  behavior: { speedScore: 88, brakingScore: 82, turningScore: 85 },
  timeOfDayRisk: [
    { period: '06:00–12:00', label: 'Morning', riskLevel: 'low', score: 12 },
    { period: '12:00–18:00', label: 'Afternoon', riskLevel: 'low', score: 18 },
    { period: '18:00–22:00', label: 'Evening', riskLevel: 'medium', score: 28 },
    { period: '22:00–06:00', label: 'Night', riskLevel: 'high', score: 42 },
  ],
  recommendations: [
    'Avoid night driving when possible; risk is highest 22:00–06:00.',
    'Smooth braking improves your braking score; allow more following distance.',
    'Maintain consistent speed on highways to improve speed score.',
  ],
}

function riskLevelColor(level: string): string {
  if (level === 'low') return 'var(--success, #22c55e)'
  if (level === 'medium') return 'var(--warning, #eab308)'
  return 'var(--danger, #e11d48)'
}

export default function DrivingAnalytics() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<DrivingAnalyticsData | null>(() =>
    api.getDrivingAnalytics()
  )
  const analytics = data ?? (error ? FALLBACK_ANALYTICS : null)

  if (loading) {
    return (
      <DriverScreen title="Driving Analytics & Risk Exposure" subtitle="Behavior, risk score, and tips">
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </DriverScreen>
    )
  }

  if (!analytics) {
    return (
      <DriverScreen title="Driving Analytics & Risk Exposure" subtitle="Behavior, risk score, and tips">
        <p style={{ color: 'var(--danger)' }}>{error ?? 'Unable to load analytics'}</p>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </DriverScreen>
    )
  }

  const { riskScore, riskLevel, behavior, timeOfDayRisk, recommendations } = analytics

  return (
    <DriverScreen title="Driving Analytics & Risk Exposure" subtitle="Behavior, risk score, and tips">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
      {error && (
        <p style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: 8 }}>
          {t('fleet.showingSampleData')}
        </p>
      )}

      <div className="card-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <h3>Risk score</h3>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0', color: riskLevelColor(riskLevel) }}>
            {riskScore}
          </p>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
            {riskLevel} exposure
          </p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Lower is better. Based on mobility and trip history.
          </p>
        </div>
        <div className="card">
          <h3>Behavior</h3>
          <p style={{ margin: '0.25rem 0', fontSize: '0.95rem' }}>
            Speed: <strong>{behavior.speedScore}</strong>/100
          </p>
          <p style={{ margin: '0.25rem 0', fontSize: '0.95rem' }}>
            Braking: <strong>{behavior.brakingScore}</strong>/100
          </p>
          <p style={{ margin: '0.25rem 0', fontSize: '0.95rem' }}>
            Turning: <strong>{behavior.turningScore}</strong>/100
          </p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            From driving behavior analysis.
          </p>
        </div>
      </div>

      <section className="card" style={{ marginBottom: '1.5rem' }}>
        <h3>Time of day risk</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Risk exposure by time period (higher score = higher risk).
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {timeOfDayRisk.map((row) => (
            <li
              key={row.period}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
                padding: '0.5rem 0',
                borderBottom: '1px solid var(--border-subtle, #eee)',
              }}
            >
              <span style={{ fontWeight: 600 }}>{row.label}</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{row.period}</span>
              <span
                style={{
                  fontSize: '0.85rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: 6,
                  background: riskLevelColor(row.riskLevel) + '22',
                  color: riskLevelColor(row.riskLevel),
                  fontWeight: 600,
                }}
              >
                {row.riskLevel}
              </span>
              <span style={{ fontWeight: 600, minWidth: 32 }}>{row.score}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h3>Recommendations</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
          Tips to reduce risk and improve scores.
        </p>
        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
          {recommendations.map((rec, i) => (
            <li key={i} style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}>
              {rec}
            </li>
          ))}
        </ul>
      </section>
    </DriverScreen>
  )
}
