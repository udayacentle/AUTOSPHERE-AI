import { Link } from 'react-router-dom'
import DealerScreen from './DealerScreen'
import { api, type DealerMarketTrendsData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_DEALER_MARKET_TRENDS } from './dealerFallbackData'
import './DealerSection.css'

function formatDate(s: string) {
  try { return new Date(s).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) } catch { return s }
}

export default function MarketTrendInsights() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<DealerMarketTrendsData>(() => api.getDealerMarketTrends())
  const displayData = (data != null && typeof data === 'object') ? data : (error ? FALLBACK_DEALER_MARKET_TRENDS : null)
  const insights = displayData?.insights ?? []
  const priceIndex = displayData?.priceIndex ?? {}

  if (loading && !displayData) {
    return (
      <DealerScreen title="Market Trend Insights" subtitle="Market signals and price index">
        <p className="dealer-loading">{t('common.loading')}</p>
      </DealerScreen>
    )
  }
  if (!displayData) {
    return (
      <DealerScreen title="Market Trend Insights" subtitle="Market signals and price index">
        <div className="dealer-error">
          <p>Could not load market trends.</p>
          <button type="button" className="dealer-btn" onClick={() => refetch()}>{t('common.refresh')}</button>
        </div>
      </DealerScreen>
    )
  }

  const isLive = !error && displayData?.dataSource === 'live'

  return (
    <DealerScreen title="Market Trend Insights" subtitle="Market signals and price index">
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
          <Link to="dynamic-pricing-engine">Dynamic Pricing</Link>
          <Link to="demand-forecast-dashboard">Demand Forecast</Link>
        </nav>
        <section className="dealer-section">
          <h3>Insights</h3>
          <p className="dealer-desc">Segment demand and price trends.</p>
          <div className="dealer-table-wrap">
            <table className="dealer-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Segment</th>
                  <th>Trend</th>
                  <th>Impact</th>
                </tr>
              </thead>
              <tbody>
                {insights.map((i) => (
                  <tr key={i.id}>
                    <td><strong>{i.title}</strong></td>
                    <td>{i.segment}</td>
                    <td>{i.trend}</td>
                    <td>{i.impact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        {Object.keys(priceIndex).length > 0 && (
          <section className="dealer-section">
            <h3>Price index (vs baseline)</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {Object.entries(priceIndex).map(([segment, value]) => (
                <li key={segment} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <strong>{segment}</strong>: {value}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </DealerScreen>
  )
}
