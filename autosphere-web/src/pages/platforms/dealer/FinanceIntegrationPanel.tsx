import { Link } from 'react-router-dom'
import DealerScreen from './DealerScreen'
import { api, type DealerFinanceIntegrationData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_DEALER_FINANCE } from './dealerFallbackData'
import './DealerSection.css'

function formatDate(s: string) {
  try { return new Date(s).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) } catch { return s }
}

export default function FinanceIntegrationPanel() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<DealerFinanceIntegrationData>(() => api.getDealerFinanceIntegration())
  const displayData = (data != null && typeof data === 'object') ? data : (error ? FALLBACK_DEALER_FINANCE : null)
  const lenders = displayData?.lenders ?? []
  const summary = displayData?.summary

  if (loading && !displayData) {
    return (
      <DealerScreen title="Finance Integration Panel" subtitle="Lender connections and approval stats">
        <p className="dealer-loading">{t('common.loading')}</p>
      </DealerScreen>
    )
  }
  if (!displayData) {
    return (
      <DealerScreen title="Finance Integration Panel" subtitle="Lender connections and approval stats">
        <div className="dealer-error">
          <p>Could not load finance data.</p>
          <button type="button" className="dealer-btn" onClick={() => refetch()}>{t('common.refresh')}</button>
        </div>
      </DealerScreen>
    )
  }

  const isLive = !error && displayData?.dataSource === 'live'

  return (
    <DealerScreen title="Finance Integration Panel" subtitle="Lender connections and approval stats">
      <div className="dealer-page">
        <div className="dealer-toolbar">
          <span className={`dealer-badge ${isLive ? 'dealer-badge-live' : 'dealer-badge-sample'}`}>{isLive ? 'Live data' : 'Sample data'}</span>
          {displayData?.lastUpdated && <span className="dealer-meta">Last updated: {formatDate(displayData.lastUpdated)}</span>}
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
          <Link to="sales-analytics">Sales Analytics</Link>
        </nav>
        {summary && (
          <div className="dealer-kpis">
            <div className="dealer-kpi-card">
              <h3>Applications (month)</h3>
              <p className="dealer-kpi-value">{summary.applicationsThisMonth}</p>
            </div>
            <div className="dealer-kpi-card">
              <h3>Approved</h3>
              <p className="dealer-kpi-value">{summary.approved}</p>
            </div>
            <div className="dealer-kpi-card">
              <h3>Avg APR %</h3>
              <p className="dealer-kpi-value">{summary.avgApr}%</p>
            </div>
          </div>
        )}
        <section className="dealer-section">
          <h3>Lenders</h3>
          <p className="dealer-desc">Connected lenders and approval rates.</p>
          <div className="dealer-table-wrap">
            <table className="dealer-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Approval rate</th>
                </tr>
              </thead>
              <tbody>
                {lenders.map((l) => (
                  <tr key={l.id}>
                    <td><strong>{l.name}</strong></td>
                    <td>{l.status}</td>
                    <td>{(l.approvalRate * 100).toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DealerScreen>
  )
}
