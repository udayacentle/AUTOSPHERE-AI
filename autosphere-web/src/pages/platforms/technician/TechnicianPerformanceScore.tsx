import TechnicianScreen from './TechnicianScreen'
import './TechnicianSections.css'
import { api, type TechnicianPerformanceData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_PERFORMANCE } from './technicianFallbacks'

export default function TechnicianPerformanceScore() {
  const { t } = useI18n()
  const { data: perf, loading, error, refetch } = useApiData<TechnicianPerformanceData | null>(() =>
    api.getTechnicianPerformance()
  )
  const perfDisplay = perf ?? (error ? FALLBACK_PERFORMANCE : null)

  if (loading && !perfDisplay) {
    return (
      <TechnicianScreen title="Technician Performance Score" subtitle="Quality, speed, and efficiency metrics">
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </TechnicianScreen>
    )
  }

  if (!perfDisplay) return null

  return (
    <TechnicianScreen title="Technician Performance Score" subtitle="Quality, speed, and efficiency metrics">
      {error && (
        <div className="tech-offline-banner" style={{ marginBottom: '1rem' }}>
          <span>Showing sample data. Start backend in <code>autosphere_full_production_monorepo/services/backend</code> for live data.</span>
          <button type="button" className="btn-refresh" onClick={() => refetch()}>Retry</button>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
      <section className="card">
        <h3>Score breakdown</h3>
        <div className="tech-perf-grid">
          <div className="tech-perf-item">
            <span className="tech-perf-label">First-time fix rate</span>
            <span className="tech-perf-value">{perfDisplay.firstTimeFixRate}%</span>
          </div>
          <div className="tech-perf-item">
            <span className="tech-perf-label">Rework %</span>
            <span className="tech-perf-value">{perfDisplay.reworkPercent}%</span>
          </div>
          <div className="tech-perf-item">
            <span className="tech-perf-label">Customer rating</span>
            <span className="tech-perf-value">{perfDisplay.customerRating} / 5</span>
          </div>
          <div className="tech-perf-item">
            <span className="tech-perf-label">Workshop average</span>
            <span className="tech-perf-value">{perfDisplay.workshopAverage} / 5</span>
          </div>
        </div>
      </section>
      <section className="card">
        <h3>Trends</h3>
        <p>Score over time; comparison to workshop average.</p>
        <div className="tech-table-wrap">
          <table className="tech-table">
            <thead>
              <tr><th>Period</th><th>Score</th><th>Label</th></tr>
            </thead>
            <tbody>
              {(Array.isArray(perfDisplay.trends) ? perfDisplay.trends : []).map((tr, i) => (
                <tr key={i}>
                  <td>{tr.period}</td>
                  <td>{tr.score}</td>
                  <td>{tr.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="card">
        <h3>Goals & feedback</h3>
        <div className="tech-table-wrap">
          <table className="tech-table">
            <thead>
              <tr><th>Goal</th><th>Target</th><th>Current</th><th>Unit</th></tr>
            </thead>
            <tbody>
              {(Array.isArray(perfDisplay.goals) ? perfDisplay.goals : []).map((g, i) => (
                <tr key={i}>
                  <td>{g.name}</td>
                  <td>{g.target}</td>
                  <td>{g.current}</td>
                  <td>{g.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </TechnicianScreen>
  )
}
