import { useState } from 'react'
import { Link } from 'react-router-dom'
import DealerScreen from './DealerScreen'
import { api, type DealerLeadsData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_DEALER_LEADS } from './dealerFallbackData'
import './DealerSection.css'

function formatDate(s: string) {
  try {
    return new Date(s).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return s
  }
}

export default function LeadManagement() {
  const { t } = useI18n()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { data, loading, error, refetch } = useApiData<DealerLeadsData>(() => api.getDealerLeads())
  const displayData = (data != null && typeof data === 'object') ? data : (error ? FALLBACK_DEALER_LEADS : null)
  const leads = displayData?.leads ?? []

  const filtered = statusFilter === 'all' ? leads : leads.filter((l) => (l.status || '').toLowerCase() === statusFilter.toLowerCase())

  if (loading && !displayData) {
    return (
      <DealerScreen title="Lead Management" subtitle="Incoming leads, assignment, and follow-up">
        <p className="dealer-loading">{t('common.loading')}</p>
      </DealerScreen>
    )
  }
  if (!displayData) {
    return (
      <DealerScreen title="Lead Management" subtitle="Incoming leads, assignment, and follow-up">
        <div className="dealer-error">
          <p>Could not load leads.</p>
          <button type="button" className="dealer-btn" onClick={() => refetch()}>{t('common.refresh')}</button>
        </div>
      </DealerScreen>
    )
  }

  const isLive = !error && displayData?.dataSource === 'live'

  return (
    <DealerScreen title="Lead Management" subtitle="Incoming leads, assignment, and follow-up">
      <div className="dealer-page">
        <div className="dealer-toolbar">
          <span className={`dealer-badge ${isLive ? 'dealer-badge-live' : 'dealer-badge-sample'}`}>
            {isLive ? 'Live data' : 'Sample data'}
          </span>
          {displayData?.lastUpdated && (
            <span className="dealer-meta">Last updated: {formatDate(displayData.lastUpdated)}</span>
          )}
          <button type="button" className="dealer-btn" onClick={() => refetch()}>{t('common.refresh')}</button>
        </div>
        {error && (
          <div className="dealer-sample-banner">
            <span>{t('common.sampleDataBanner')}</span>
            <button type="button" className="dealer-btn" onClick={() => refetch()}>{t('common.refresh')}</button>
          </div>
        )}
        <nav className="dealer-quick-links">
          <Link to="inventory-management">Inventory</Link>
          <Link to="sales-funnel">Sales Funnel</Link>
          <Link to="customer-profile-view">Customers</Link>
        </nav>
        <div className="dealer-kpis">
          <div className="dealer-kpi-card">
            <h3>Total leads</h3>
            <p className="dealer-kpi-value">{leads.length}</p>
          </div>
          <div className="dealer-kpi-card">
            <h3>New</h3>
            <p className="dealer-kpi-value">{leads.filter((l) => (l.status || '').toLowerCase() === 'new').length}</p>
          </div>
          <div className="dealer-kpi-card">
            <h3>Qualified</h3>
            <p className="dealer-kpi-value">{leads.filter((l) => (l.status || '').toLowerCase() === 'qualified').length}</p>
          </div>
        </div>
        <section className="dealer-section">
          <h3>Lead queue</h3>
          <p className="dealer-desc">New, assigned, contacted, qualified, lost.</p>
          <div className="dealer-filters">
            {['all', 'new', 'contacted', 'qualified', 'lost'].map((s) => (
              <button
                key={s}
                type="button"
                className={`dealer-filter-btn ${statusFilter === s ? 'active' : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <div className="dealer-table-wrap">
            <table className="dealer-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id}>
                    <td><strong>{l.name}</strong></td>
                    <td>{l.email} · {l.phone}</td>
                    <td>{l.source}</td>
                    <td><span className={`dealer-status dealer-status-${(l.status || '').toLowerCase()}`}>{l.status}</span></td>
                    <td>{l.score}</td>
                    <td>{formatDate(l.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <p className="dealer-empty">No leads match the filter.</p>}
        </section>
      </div>
    </DealerScreen>
  )
}
