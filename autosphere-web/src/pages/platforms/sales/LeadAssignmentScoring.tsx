import { Link } from 'react-router-dom'
import SalesScreen from './SalesScreen'
import { api, type SalesLeadAssignmentData } from '../../api/client'
import { useApiData } from '../../hooks/useApiData'
import { useI18n } from '../../i18n/context'
import { FALLBACK_SALES_LEAD_ASSIGNMENT } from './salesFallbackData'
import './SalesSection.css'

function formatDate(s: string) {
  try { return new Date(s).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) } catch { return s }
}

export default function LeadAssignmentScoring() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<SalesLeadAssignmentData>(() => api.getSalesLeadAssignment())
  const displayData = (data != null && typeof data === 'object') ? data : (error ? FALLBACK_SALES_LEAD_ASSIGNMENT : null)
  const queue = displayData?.leadQueue ?? []
  const rules = displayData?.scoringRules ?? []

  if (loading && !displayData) {
    return (
      <SalesScreen title="Lead Assignment & Scoring" subtitle="Assign and score incoming leads">
        <p className="sales-loading">{t('common.loading')}</p>
      </SalesScreen>
    )
  }
  if (!displayData) {
    return (
      <SalesScreen title="Lead Assignment & Scoring" subtitle="Assign and score incoming leads">
        <div className="sales-error">
          <p>Could not load lead assignment.</p>
          <button type="button" className="sales-btn" onClick={() => refetch()}>{t('common.refresh')}</button>
        </div>
      </SalesScreen>
    )
  }

  const isLive = !error && displayData?.dataSource === 'live'

  return (
    <SalesScreen title="Lead Assignment & Scoring" subtitle="Assign and score incoming leads">
      <div className="sales-page">
        <div className="sales-toolbar">
          <span className={`sales-badge ${isLive ? 'sales-badge-live' : 'sales-badge-sample'}`}>
            {isLive ? 'Live data' : 'Sample data'}
          </span>
          {displayData?.lastUpdated && (
            <span className="sales-meta">Last updated: {formatDate(displayData.lastUpdated)}</span>
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
          <Link to="customer-interaction-logs">Interactions</Link>
          <Link to="follow-up-scheduler">Follow-ups</Link>
        </nav>
        <section className="sales-section">
          <h3>Lead queue</h3>
          <p className="sales-desc">New leads from website, walk-ins, referrals. Assignment mode: {displayData?.assignmentMode ?? '—'}</p>
          <div className="sales-table-wrap">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Source</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Assigned to</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((l) => (
                  <tr key={l.id}>
                    <td>{l.name}</td>
                    <td>{l.email}</td>
                    <td>{l.source}</td>
                    <td>{l.score}</td>
                    <td>{l.status}</td>
                    <td>{l.assignedTo ?? '—'}</td>
                    <td>{l.createdAt ? formatDate(l.createdAt) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {queue.length === 0 && <p className="sales-empty">No leads in queue.</p>}
        </section>
        <section className="sales-section">
          <h3>Scoring rules</h3>
          <p className="sales-desc">AI or rule-based: budget, intent, vehicle interest.</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {rules.map((r) => (
              <li key={r.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                {r.name} — weight {(r.weight * 100).toFixed(0)}%
              </li>
            ))}
          </ul>
          {rules.length === 0 && <p className="sales-empty">No scoring rules.</p>}
        </section>
      </div>
    </SalesScreen>
  )
}
