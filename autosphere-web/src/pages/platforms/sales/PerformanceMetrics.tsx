import { Link } from 'react-router-dom'
import SalesScreen from './SalesScreen'
import { api, type SalesPerformanceMetricsData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_SALES_PERFORMANCE } from './salesFallbackData'
import './SalesSection.css'

export default function PerformanceMetrics() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<SalesPerformanceMetricsData>(() => api.getSalesPerformanceMetrics())
  const displayData = (data != null && typeof data === 'object') ? data : (error ? FALLBACK_SALES_PERFORMANCE : null)
  const conversion = displayData?.conversionRates ?? { leadToQualified: 0, qualifiedToProposal: 0, proposalToWon: 0 }
  const activity = displayData?.activity ?? { callsThisWeek: 0, meetings: 0, testDrives: 0, proposalsSent: 0 }
  const rankings = displayData?.rankings ?? []

  if (loading && !displayData) {
    return (
      <SalesScreen title="Performance Metrics" subtitle="Individual and team sales performance">
        <p className="sales-loading">{t('common.loading')}</p>
      </SalesScreen>
    )
  }
  if (!displayData) {
    return (
      <SalesScreen title="Performance Metrics" subtitle="Individual and team sales performance">
        <div className="sales-error">
          <p>Could not load performance.</p>
          <button type="button" className="sales-btn" onClick={() => refetch()}>{t('common.refresh')}</button>
        </div>
      </SalesScreen>
    )
  }

  const isLive = !error && displayData?.dataSource === 'live'

  return (
    <SalesScreen title="Performance Metrics" subtitle="Individual and team sales performance">
      <div className="sales-page">
        <div className="sales-toolbar">
          <span className={`sales-badge ${isLive ? 'sales-badge-live' : 'sales-badge-sample'}`}>
            {isLive ? 'Live data' : 'Sample data'}
          </span>
          {displayData?.lastUpdated && (
            <span className="sales-meta">Last updated: {new Date(displayData.lastUpdated).toLocaleString()}</span>
          )}
          <button type="button" className="sales-btn" onClick={() => refetch()}>{t('common.refresh')}</button>
        </div>
        {error && (
          <div className="sales-sample-banner">
            <span>{t('common.sampleDataBanner')}</span>
            <button type="button" className="sales-btn" onClick={() => refetch()}>{t('common.refresh')}</button>
          </div>
        )}
        <nav className="sales-quick-links">
          <Link to="sales-dashboard">Dashboard</Link>
          <Link to="target-achievement-tracker">Targets</Link>
          <Link to="commission-tracker">Commission</Link>
        </nav>
        <div className="sales-kpis">
          <div className="sales-kpi-card">
            <h3>Lead → Qualified</h3>
            <p className="sales-kpi-value">{(conversion.leadToQualified * 100).toFixed(0)}%</p>
          </div>
          <div className="sales-kpi-card">
            <h3>Qualified → Proposal</h3>
            <p className="sales-kpi-value">{(conversion.qualifiedToProposal * 100).toFixed(0)}%</p>
          </div>
          <div className="sales-kpi-card">
            <h3>Proposal → Won</h3>
            <p className="sales-kpi-value">{(conversion.proposalToWon * 100).toFixed(0)}%</p>
          </div>
          <div className="sales-kpi-card">
            <h3>Calls this week</h3>
            <p className="sales-kpi-value">{activity.callsThisWeek}</p>
          </div>
          <div className="sales-kpi-card">
            <h3>Meetings</h3>
            <p className="sales-kpi-value">{activity.meetings}</p>
          </div>
          <div className="sales-kpi-card">
            <h3>Test drives</h3>
            <p className="sales-kpi-value">{activity.testDrives}</p>
          </div>
          <div className="sales-kpi-card">
            <h3>Proposals sent</h3>
            <p className="sales-kpi-value">{activity.proposalsSent}</p>
          </div>
        </div>
        <section className="sales-section">
          <h3>Rankings</h3>
          <p className="sales-desc">Leaderboard by volume, revenue, target %.</p>
          <div className="sales-table-wrap">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Volume</th>
                  <th>Revenue</th>
                  <th>Target %</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((r) => (
                  <tr key={r.rank}>
                    <td>{r.rank}</td>
                    <td>{r.name}</td>
                    <td>{r.volume}</td>
                    <td>${r.revenue.toLocaleString()}</td>
                    <td>{r.targetPercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rankings.length === 0 && <p className="sales-empty">No rankings.</p>}
        </section>
      </div>
    </SalesScreen>
  )
}
