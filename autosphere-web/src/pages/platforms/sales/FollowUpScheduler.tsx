import { Link } from 'react-router-dom'
import SalesScreen from './SalesScreen'
import { api, type SalesFollowUpData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_SALES_FOLLOW_UP } from './salesFallbackData'
import './SalesSection.css'

function formatDate(s: string) {
  try { return new Date(s).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) } catch { return s }
}

export default function FollowUpScheduler() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<SalesFollowUpData>(() => api.getSalesFollowUp())
  const displayData = (data != null && typeof data === 'object') ? data : (error ? FALLBACK_SALES_FOLLOW_UP : null)
  const upcoming = displayData?.upcoming ?? []
  const overdue = displayData?.overdue ?? []

  if (loading && !displayData) {
    return (
      <SalesScreen title="Follow-Up Scheduler" subtitle="Schedule and manage follow-up tasks">
        <p className="sales-loading">{t('common.loading')}</p>
      </SalesScreen>
    )
  }
  if (!displayData) {
    return (
      <SalesScreen title="Follow-Up Scheduler" subtitle="Schedule and manage follow-up tasks">
        <div className="sales-error">
          <p>Could not load follow-ups.</p>
          <button type="button" className="sales-btn" onClick={() => refetch()}>{t('common.refresh')}</button>
        </div>
      </SalesScreen>
    )
  }

  const isLive = !error && displayData?.dataSource === 'live'

  return (
    <SalesScreen title="Follow-Up Scheduler" subtitle="Schedule and manage follow-up tasks">
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
          <Link to="lead-assignment-scoring">Leads</Link>
          <Link to="customer-interaction-logs">Interactions</Link>
        </nav>
        <div className="sales-kpis">
          <div className="sales-kpi-card">
            <h3>Upcoming</h3>
            <p className="sales-kpi-value">{upcoming.length}</p>
          </div>
          <div className="sales-kpi-card">
            <h3>Overdue</h3>
            <p className="sales-kpi-value">{overdue.length}</p>
          </div>
        </div>
        <section className="sales-section">
          <h3>Upcoming follow-ups</h3>
          <p className="sales-desc">Calls, meetings, test drives due.</p>
          <div className="sales-table-wrap">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Type</th>
                  <th>Due</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((f) => (
                  <tr key={f.id}>
                    <td>{f.leadName}</td>
                    <td>{f.type}</td>
                    <td>{formatDate(f.due)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {upcoming.length === 0 && <p className="sales-empty">No upcoming follow-ups.</p>}
        </section>
        <section className="sales-section">
          <h3>Overdue</h3>
          <p className="sales-desc">Missed follow-ups and reschedule options.</p>
          <div className="sales-table-wrap">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Type</th>
                  <th>Was due</th>
                </tr>
              </thead>
              <tbody>
                {overdue.map((f) => (
                  <tr key={f.id}>
                    <td>{f.leadName}</td>
                    <td>{f.type}</td>
                    <td>{formatDate(f.due)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {overdue.length === 0 && <p className="sales-empty">No overdue follow-ups.</p>}
        </section>
      </div>
    </SalesScreen>
  )
}
