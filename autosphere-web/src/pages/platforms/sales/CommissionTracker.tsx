import { Link } from 'react-router-dom'
import SalesScreen from './SalesScreen'
import { api, type SalesCommissionData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_SALES_COMMISSION } from './salesFallbackData'
import './SalesSection.css'

export default function CommissionTracker() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<SalesCommissionData>(() => api.getSalesCommission())
  const displayData = (data != null && typeof data === 'object') ? data : (error ? FALLBACK_SALES_COMMISSION : null)
  const payoutHistory = displayData?.payoutHistory ?? []
  const byDeal = displayData?.byDeal ?? []

  if (loading && !displayData) {
    return (
      <SalesScreen title="Commission Tracker" subtitle="Track earned and pending commission">
        <p className="sales-loading">{t('common.loading')}</p>
      </SalesScreen>
    )
  }
  if (!displayData) {
    return (
      <SalesScreen title="Commission Tracker" subtitle="Track earned and pending commission">
        <div className="sales-error">
          <p>Could not load commission.</p>
          <button type="button" className="sales-btn" onClick={() => refetch()}>{t('common.refresh')}</button>
        </div>
      </SalesScreen>
    )
  }

  const isLive = !error && displayData?.dataSource === 'live'

  return (
    <SalesScreen title="Commission Tracker" subtitle="Track earned and pending commission">
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
          <Link to="performance-metrics">Performance</Link>
          <Link to="target-achievement-tracker">Targets</Link>
        </nav>
        <div className="sales-kpis">
          <div className="sales-kpi-card">
            <h3>Earned commission</h3>
            <p className="sales-kpi-value">${(displayData?.earned ?? 0).toLocaleString()}</p>
          </div>
          <div className="sales-kpi-card">
            <h3>Pending</h3>
            <p className="sales-kpi-value">${(displayData?.pending ?? 0).toLocaleString()}</p>
          </div>
        </div>
        <section className="sales-section">
          <h3>By deal</h3>
          <p className="sales-desc">Commission by deal, vehicle, status.</p>
          <div className="sales-table-wrap">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Deal</th>
                  <th>Vehicle</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {byDeal.map((d) => (
                  <tr key={d.dealId}>
                    <td>{d.dealId}</td>
                    <td>{d.vehicle}</td>
                    <td>${d.amount.toLocaleString()}</td>
                    <td>{d.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="sales-section">
          <h3>Payout history</h3>
          <p className="sales-desc">Past payouts and payment schedule.</p>
          <div className="sales-table-wrap">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Amount</th>
                  <th>Paid at</th>
                </tr>
              </thead>
              <tbody>
                {payoutHistory.map((p) => (
                  <tr key={p.id}>
                    <td>{p.period}</td>
                    <td>${p.amount.toLocaleString()}</td>
                    <td>{p.paidAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {payoutHistory.length === 0 && <p className="sales-empty">No payout history.</p>}
        </section>
      </div>
    </SalesScreen>
  )
}
