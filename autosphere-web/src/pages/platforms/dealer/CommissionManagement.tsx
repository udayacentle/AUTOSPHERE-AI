import { Link } from 'react-router-dom'
import DealerScreen from './DealerScreen'
import { api, type DealerCommissionData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_DEALER_COMMISSION } from './dealerFallbackData'
import './DealerSection.css'

function formatDate(s: string) {
  try { return new Date(s).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) } catch { return s }
}

export default function CommissionManagement() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<DealerCommissionData>(() => api.getDealerCommission())
  const displayData = (data != null && typeof data === 'object') ? data : (error ? FALLBACK_DEALER_COMMISSION : null)
  const byStaff = displayData?.byStaff ?? []

  if (loading && !displayData) {
    return (
      <DealerScreen title="Commission Management" subtitle="Staff commissions and payouts">
        <p className="dealer-loading">{t('common.loading')}</p>
      </DealerScreen>
    )
  }
  if (!displayData) {
    return (
      <DealerScreen title="Commission Management" subtitle="Staff commissions and payouts">
        <div className="dealer-error">
          <p>Could not load commission data.</p>
          <button type="button" className="dealer-btn" onClick={() => refetch()}>{t('common.refresh')}</button>
        </div>
      </DealerScreen>
    )
  }

  const isLive = !error && displayData?.dataSource === 'live'

  return (
    <DealerScreen title="Commission Management" subtitle="Staff commissions and payouts">
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
          <Link to="sales-analytics">Sales Analytics</Link>
          <Link to="lead-management">Leads</Link>
        </nav>
        <div className="dealer-kpis">
          <div className="dealer-kpi-card">
            <h3>Total earned</h3>
            <p className="dealer-kpi-value">${(displayData?.totalEarned ?? 0).toLocaleString()}</p>
          </div>
          <div className="dealer-kpi-card">
            <h3>Pending</h3>
            <p className="dealer-kpi-value">${(displayData?.pending ?? 0).toLocaleString()}</p>
          </div>
        </div>
        <section className="dealer-section">
          <h3>By staff</h3>
          <div className="dealer-table-wrap">
            <table className="dealer-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Earned</th>
                  <th>Pending</th>
                  <th>Deals</th>
                </tr>
              </thead>
              <tbody>
                {byStaff.map((s) => (
                  <tr key={s.staffId}>
                    <td><strong>{s.name}</strong></td>
                    <td>${s.earned.toLocaleString()}</td>
                    <td>${s.pending.toLocaleString()}</td>
                    <td>{s.deals}</td>
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
