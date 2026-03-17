import { Link } from 'react-router-dom'
import SalesScreen from './SalesScreen'
import { api, type SalesCustomerInteractionsData } from '../../api/client'
import { useApiData } from '../../hooks/useApiData'
import { useI18n } from '../../i18n/context'
import { FALLBACK_SALES_INTERACTIONS } from './salesFallbackData'
import './SalesSection.css'

function formatDate(s: string) {
  try { return new Date(s).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) } catch { return s }
}

export default function CustomerInteractionLogs() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<SalesCustomerInteractionsData>(() => api.getSalesCustomerInteractions())
  const displayData = (data != null && typeof data === 'object') ? data : (error ? FALLBACK_SALES_INTERACTIONS : null)
  const activities = displayData?.activities ?? []
  const notesByLead = displayData?.notesByLead ?? {}

  if (loading && !displayData) {
    return (
      <SalesScreen title="Customer Interaction Logs" subtitle="Log and view all customer touchpoints">
        <p className="sales-loading">{t('common.loading')}</p>
      </SalesScreen>
    )
  }
  if (!displayData) {
    return (
      <SalesScreen title="Customer Interaction Logs" subtitle="Log and view all customer touchpoints">
        <div className="sales-error">
          <p>Could not load interactions.</p>
          <button type="button" className="sales-btn" onClick={() => refetch()}>{t('common.refresh')}</button>
        </div>
      </SalesScreen>
    )
  }

  const isLive = !error && displayData?.dataSource === 'live'

  return (
    <SalesScreen title="Customer Interaction Logs" subtitle="Log and view all customer touchpoints">
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
          <Link to="follow-up-scheduler">Follow-ups</Link>
        </nav>
        <section className="sales-section">
          <h3>Activity log</h3>
          <p className="sales-desc">Calls, emails, test drives, showroom visits.</p>
          <div className="sales-table-wrap">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Lead ID</th>
                  <th>Summary</th>
                  <th>Rep</th>
                  <th>At</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((a) => (
                  <tr key={a.id}>
                    <td>{a.type}</td>
                    <td>{a.leadId}</td>
                    <td>{a.summary}</td>
                    <td>{a.rep}</td>
                    <td>{formatDate(a.at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {activities.length === 0 && <p className="sales-empty">No activities.</p>}
        </section>
        <section className="sales-section">
          <h3>Notes by lead</h3>
          <p className="sales-desc">Per-customer notes and next steps.</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {Object.entries(notesByLead).map(([leadId, note]) => (
              <li key={leadId} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                <strong>{leadId}</strong>: {note}
              </li>
            ))}
          </ul>
          {Object.keys(notesByLead).length === 0 && <p className="sales-empty">No notes.</p>}
        </section>
      </div>
    </SalesScreen>
  )
}
