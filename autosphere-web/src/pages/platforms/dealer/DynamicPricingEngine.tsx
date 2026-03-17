import { Link } from 'react-router-dom'
import DealerScreen from './DealerScreen'
import { api, type DealerDynamicPricingData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_DEALER_PRICING } from './dealerFallbackData'
import './DealerSection.css'

function formatDate(s: string) {
  try { return new Date(s).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) } catch { return s }
}

export default function DynamicPricingEngine() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<DealerDynamicPricingData>(() => api.getDealerDynamicPricing())
  const displayData = (data != null && typeof data === 'object') ? data : (error ? FALLBACK_DEALER_PRICING : null)
  const suggestedPrices = displayData?.suggestedPrices ?? []
  const rules = displayData?.rules ?? []

  if (loading && !displayData) {
    return (
      <DealerScreen title="Dynamic Pricing Engine" subtitle="AI-driven pricing and margin optimization">
        <p className="dealer-loading">{t('common.loading')}</p>
      </DealerScreen>
    )
  }
  if (!displayData) {
    return (
      <DealerScreen title="Dynamic Pricing Engine" subtitle="AI-driven pricing and margin optimization">
        <div className="dealer-error">
          <p>Could not load pricing data.</p>
          <button type="button" className="dealer-btn" onClick={() => refetch()}>{t('common.refresh')}</button>
        </div>
      </DealerScreen>
    )
  }

  const isLive = !error && displayData?.dataSource === 'live'

  return (
    <DealerScreen title="Dynamic Pricing Engine" subtitle="AI-driven pricing and margin optimization">
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
          <Link to="demand-forecast-dashboard">Demand Forecast</Link>
        </nav>
        <section className="dealer-section">
          <h3>Suggested price</h3>
          <p className="dealer-desc">Market-based and demand-based recommendations.</p>
          <div className="dealer-table-wrap">
            <table className="dealer-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Current</th>
                  <th>Suggested</th>
                  <th>Margin</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {suggestedPrices.map((p) => (
                  <tr key={p.vehicleId}>
                    <td><strong>{p.make} {p.model}</strong></td>
                    <td>${p.currentPrice.toLocaleString()}</td>
                    <td>${p.suggestedPrice.toLocaleString()}</td>
                    <td>{(p.margin * 100).toFixed(0)}%</td>
                    <td>{p.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="dealer-section">
          <h3>Margin & discounts</h3>
          <p className="dealer-desc">Floor price, max discount, promo rules.</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {rules.map((r) => (
              <li key={r.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                <strong>{r.name}</strong>: {r.value}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </DealerScreen>
  )
}
