import { Link } from 'react-router-dom'
import DealerScreen from './DealerScreen'
import { api, type DealerSalesFunnelData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_DEALER_FUNNEL } from './dealerFallbackData'
import './DealerSection.css'

function formatDate(s: string) {
  try { return new Date(s).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) } catch { return s }
}

export default function SalesFunnel() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<DealerSalesFunnelData>(() => api.getDealerSalesFunnel())
  const displayData = (data != null && typeof data === 'object') ? data : (error ? FALLBACK_DEALER_FUNNEL : null)
  const stages = displayData?.stages ?? []
  const summary = displayData?.summary

  if (loading && !displayData) {
    return (
      <DealerScreen title="Sales Funnel" subtitle="Pipeline stages and conversion">
        <p className="dealer-loading">{t('common.loading')}</p>
      </DealerScreen>
    )
  }
  if (!displayData) {
    return (
      <DealerScreen title="Sales Funnel" subtitle="Pipeline stages and conversion">
        <div className="dealer-error">
          <p>Could not load funnel data.</p>
          <button type="button" className="dealer-btn" onClick={() => refetch()}>{t('common.refresh')}</button>
        </div>
      </DealerScreen>
    )
  }

  const isLive = !error && displayData?.dataSource === 'live'

  return (
    <DealerScreen title="Sales Funnel" subtitle="Pipeline stages and conversion">
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
          <Link to="lead-management">Leads</Link>
          <Link to="sales-analytics">Sales Analytics</Link>
        </nav>
        {summary && (
          <div className="dealer-kpis">
            <div className="dealer-kpi-card">
              <h3>Total leads</h3>
              <p className="dealer-kpi-value">{summary.totalLeads}</p>
            </div>
            <div className="dealer-kpi-card">
              <h3>Win rate</h3>
              <p className="dealer-kpi-value">{(summary.winRate * 100).toFixed(1)}%</p>
            </div>
          </div>
        )}
        <section className="dealer-section">
          <h3>Funnel stages</h3>
          <p className="dealer-desc">Lead → Contacted → Qualified → Proposal → Closed.</p>
          <div className="dealer-table-wrap">
            <table className="dealer-table">
              <thead>
                <tr>
                  <th>Stage</th>
                  <th>Count</th>
                  <th>Conversion %</th>
                </tr>
              </thead>
              <tbody>
                {stages.map((s) => (
                  <tr key={s.stage}>
                    <td><strong>{s.stage}</strong></td>
                    <td>{s.count}</td>
                    <td>{s.conversion}%</td>
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
