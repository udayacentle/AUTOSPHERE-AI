import { Link } from 'react-router-dom'
import DealerScreen from './DealerScreen'
import { api, type DealerTradeInValuationsData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_DEALER_TRADE_IN } from './dealerFallbackData'
import './DealerSection.css'

function formatDate(s: string) {
  try { return new Date(s).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) } catch { return s }
}

export default function TradeInValuationTool() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<DealerTradeInValuationsData>(() => api.getDealerTradeInValuations())
  const displayData = (data != null && typeof data === 'object') ? data : (error ? FALLBACK_DEALER_TRADE_IN : null)
  const valuations = displayData?.valuations ?? []

  if (loading && !displayData) {
    return (
      <DealerScreen title="Trade-In Valuation Tool" subtitle="Instant trade-in value using vehicle data and market">
        <p className="dealer-loading">{t('common.loading')}</p>
      </DealerScreen>
    )
  }
  if (!displayData) {
    return (
      <DealerScreen title="Trade-In Valuation Tool" subtitle="Instant trade-in value using vehicle data and market">
        <div className="dealer-error">
          <p>Could not load valuations.</p>
          <button type="button" className="dealer-btn" onClick={() => refetch()}>{t('common.refresh')}</button>
        </div>
      </DealerScreen>
    )
  }

  const isLive = !error && displayData?.dataSource === 'live'

  return (
    <DealerScreen title="Trade-In Valuation Tool" subtitle="Instant trade-in value using vehicle data and market">
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
          <Link to="lead-management">Leads</Link>
        </nav>
        <section className="dealer-section">
          <h3>Valuation result</h3>
          <p className="dealer-desc">Range, certified offer, link to digital twin if available.</p>
          <div className="dealer-table-wrap">
            <table className="dealer-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Year</th>
                  <th>Mileage</th>
                  <th>Condition</th>
                  <th>Range (low–high)</th>
                  <th>Certified offer</th>
                </tr>
              </thead>
              <tbody>
                {valuations.map((v) => (
                  <tr key={v.id}>
                    <td><strong>{v.make} {v.model}</strong></td>
                    <td>{v.year}</td>
                    <td>{v.mileage.toLocaleString()} mi</td>
                    <td>{v.condition}</td>
                    <td>${v.rangeLow.toLocaleString()} – ${v.rangeHigh.toLocaleString()}</td>
                    <td><strong>${v.certifiedOffer.toLocaleString()}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {valuations.length === 0 && <p className="dealer-empty">No recent valuations.</p>}
        </section>
      </div>
    </DealerScreen>
  )
}
