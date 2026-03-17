import { Link } from 'react-router-dom'
import DealerScreen from './DealerScreen'
import { api, type DealerDemandForecastData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_DEALER_DEMAND } from './dealerFallbackData'
import './DealerSection.css'

function formatDate(s: string) {
  try { return new Date(s).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) } catch { return s }
}

export default function DemandForecastDashboard() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<DealerDemandForecastData>(() => api.getDealerDemandForecast())
  const displayData = (data != null && typeof data === 'object') ? data : (error ? FALLBACK_DEALER_DEMAND : null)
  const bySegment = displayData?.bySegment ?? []
  const byMonth = displayData?.byMonth ?? []

  if (loading && !displayData) {
    return (
      <DealerScreen title="Demand Forecast Dashboard" subtitle="Demand and sales forecasts by segment">
        <p className="dealer-loading">{t('common.loading')}</p>
      </DealerScreen>
    )
  }
  if (!displayData) {
    return (
      <DealerScreen title="Demand Forecast Dashboard" subtitle="Demand and sales forecasts by segment">
        <div className="dealer-error">
          <p>Could not load forecast data.</p>
          <button type="button" className="dealer-btn" onClick={() => refetch()}>{t('common.refresh')}</button>
        </div>
      </DealerScreen>
    )
  }

  const isLive = !error && displayData?.dataSource === 'live'

  return (
    <DealerScreen title="Demand Forecast Dashboard" subtitle="Demand and sales forecasts by segment">
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
          <Link to="dynamic-pricing-engine">Dynamic Pricing</Link>
        </nav>
        <section className="dealer-section">
          <h3>Demand by segment</h3>
          <p className="dealer-desc">Make, model, body type, price band.</p>
          <div className="dealer-table-wrap">
            <table className="dealer-table">
              <thead>
                <tr>
                  <th>Segment</th>
                  <th>Demand</th>
                  <th>Stock</th>
                  <th>Gap</th>
                </tr>
              </thead>
              <tbody>
                {bySegment.map((row) => (
                  <tr key={row.segment}>
                    <td><strong>{row.segment}</strong></td>
                    <td>{row.demand}</td>
                    <td>{row.stock}</td>
                    <td>{row.gap >= 0 ? `+${row.gap}` : row.gap}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="dealer-section">
          <h3>Time horizon</h3>
          <p className="dealer-desc">Weekly, monthly, quarterly forecasts.</p>
          <div className="dealer-table-wrap">
            <table className="dealer-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Demand</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {byMonth.map((row) => (
                  <tr key={row.month}>
                    <td>{row.month}</td>
                    <td>{row.demand}</td>
                    <td>{row.trend}</td>
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
