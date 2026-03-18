import PropertyScreen from './PropertyScreen'
import './PropertySections.css'
import { api, type PropertyRevenueAnalyticsData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_REVENUE_ANALYTICS } from './propertyFallbacks'

export default function RevenueAnalyticsDashboard() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<PropertyRevenueAnalyticsData | null>(() =>
    api.getPropertyRevenueAnalytics()
  )
  const revenue = data ?? (error ? FALLBACK_REVENUE_ANALYTICS : null)

  if (loading && !revenue) {
    return (
      <PropertyScreen title="Revenue Analytics Dashboard" subtitle="Revenue from parking and EV charging">
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </PropertyScreen>
    )
  }

  return (
    <PropertyScreen title="Revenue Analytics Dashboard" subtitle="Revenue from parking and EV charging (real API)">
      {error && (
        <div className="property-offline-banner">
          <span>Showing sample data. Start backend for live data.</span>
          <button type="button" className="btn-refresh" onClick={() => refetch()}>Retry</button>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
      {revenue && (
        <>
          <section className="card">
            <h3>Revenue by source</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Parking vs charging; by lot, by period.</p>
            <div className="property-table-wrap">
              <table className="property-table">
                <thead>
                  <tr><th>Source</th><th>Amount</th><th>Share</th><th>Period</th></tr>
                </thead>
                <tbody>
                  {revenue.bySource.map((s, i) => (
                    <tr key={i}>
                      <td>{s.source}</td>
                      <td>{revenue.currency} {s.amount}</td>
                      <td>{s.percent}%</td>
                      <td>{s.period}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className="card" style={{ marginTop: '1rem' }}>
            <h3>Trends by period</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Daily, weekly, monthly; YoY comparison. Export (API-ready).</p>
            <div className="property-table-wrap">
              <table className="property-table">
                <thead>
                  <tr><th>Period</th><th>Parking</th><th>EV charging</th><th>Total</th></tr>
                </thead>
                <tbody>
                  {revenue.byPeriod.map((p, i) => (
                    <tr key={i}>
                      <td>{p.period}</td>
                      <td>{revenue.currency} {p.parking}</td>
                      <td>{revenue.currency} {p.ev}</td>
                      <td><strong>{revenue.currency} {p.parking + p.ev}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </PropertyScreen>
  )
}
