import { Link } from 'react-router-dom'
import DealerScreen from './DealerScreen'
import { api, type DealerSalesAnalyticsData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_DEALER_SALES } from './dealerFallbackData'
import './DealerSection.css'

function formatDate(s: string) {
  try { return new Date(s).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) } catch { return s }
}

export default function SalesAnalytics() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<DealerSalesAnalyticsData>(() => api.getDealerSalesAnalytics())
  const displayData = (data != null && typeof data === 'object') ? data : (error ? FALLBACK_DEALER_SALES : null)
  const byMonth = displayData?.byMonth ?? []

  if (loading && !displayData) {
    return (
      <DealerScreen title="Sales Analytics" subtitle="Revenue and units sold">
        <p className="dealer-loading">{t('common.loading')}</p>
      </DealerScreen>
    )
  }
  if (!displayData) {
    return (
      <DealerScreen title="Sales Analytics" subtitle="Revenue and units sold">
        <div className="dealer-error">
          <p>Could not load sales data.</p>
          <button type="button" className="dealer-btn" onClick={() => refetch()}>{t('common.refresh')}</button>
        </div>
      </DealerScreen>
    )
  }

  const isLive = !error && displayData?.dataSource === 'live'

  return (
    <DealerScreen title="Sales Analytics" subtitle="Revenue and units sold">
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
          <Link to="sales-funnel">Sales Funnel</Link>
          <Link to="commission-management">Commission</Link>
        </nav>
        <div className="dealer-kpis">
          <div className="dealer-kpi-card">
            <h3>Total revenue</h3>
            <p className="dealer-kpi-value">${(displayData?.totalRevenue ?? 0).toLocaleString()}</p>
          </div>
          <div className="dealer-kpi-card">
            <h3>Units sold</h3>
            <p className="dealer-kpi-value">{displayData?.unitsSold ?? 0}</p>
          </div>
          <div className="dealer-kpi-card">
            <h3>Avg deal size</h3>
            <p className="dealer-kpi-value">${(displayData?.avgDealSize ?? 0).toLocaleString()}</p>
          </div>
        </div>
        <section className="dealer-section">
          <h3>By month</h3>
          <div className="dealer-table-wrap">
            <table className="dealer-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Revenue</th>
                  <th>Units</th>
                </tr>
              </thead>
              <tbody>
                {byMonth.map((row) => (
                  <tr key={row.month}>
                    <td>{row.month}</td>
                    <td>${row.revenue.toLocaleString()}</td>
                    <td>{row.units}</td>
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
