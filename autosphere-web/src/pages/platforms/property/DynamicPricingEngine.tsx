import PropertyScreen from './PropertyScreen'
import './PropertySections.css'
import { api, type PropertyDynamicPricingData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_DYNAMIC_PRICING } from './propertyFallbacks'

export default function DynamicPricingEngine() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<PropertyDynamicPricingData | null>(() =>
    api.getPropertyDynamicPricing()
  )
  const pricing = data ?? (error ? FALLBACK_DYNAMIC_PRICING : null)

  if (loading && !pricing) {
    return (
      <PropertyScreen title="Dynamic Pricing Engine" subtitle="Set and adjust parking and charging rates">
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </PropertyScreen>
    )
  }

  return (
    <PropertyScreen title="Dynamic Pricing Engine" subtitle="Set and adjust parking and charging rates (real API)">
      {error && (
        <div className="property-offline-banner">
          <span>Showing sample data. Start backend for live data.</span>
          <button type="button" className="btn-refresh" onClick={() => refetch()}>Retry</button>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
      {pricing && (
        <>
          <section className="card">
            <h3>Parking rate rules</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>By zone, time, demand; surge and discount rules.</p>
            <div className="property-table-wrap">
              <table className="property-table">
                <thead>
                  <tr><th>Zone</th><th>Base/hr</th><th>Peak multiplier</th><th>Peak hours</th></tr>
                </thead>
                <tbody>
                  {pricing.parkingRates.map((r, i) => (
                    <tr key={r.zoneId + i}>
                      <td>{r.zoneId}</td>
                      <td>${r.basePerHour}</td>
                      <td>{r.peakMultiplier}x</td>
                      <td>{r.peakHours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className="card" style={{ marginTop: '1rem' }}>
            <h3>EV charging rates</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Per kWh or per session; peak vs off-peak.</p>
            <div className="property-table-wrap">
              <table className="property-table">
                <thead>
                  <tr><th>Rate/kWh</th><th>Off-peak/kWh</th><th>Off-peak hours</th></tr>
                </thead>
                <tbody>
                  {pricing.evRates.map((r, i) => (
                    <tr key={i}>
                      <td>${r.ratePerKwh}</td>
                      <td>${r.offPeakPerKwh}</td>
                      <td>{r.offPeakHours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className="card" style={{ marginTop: '1rem' }}>
            <h3>Override & history</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Manual overrides and price change log.</p>
            <div className="property-table-wrap">
              <table className="property-table">
                <thead>
                  <tr><th>Zone</th><th>Reason</th><th>Multiplier</th><th>Valid from</th><th>Valid to</th></tr>
                </thead>
                <tbody>
                  {pricing.overrides.map((o) => (
                    <tr key={o.id}>
                      <td>{o.zoneId}</td>
                      <td>{o.reason}</td>
                      <td>{o.multiplier}x</td>
                      <td>{new Date(o.validFrom).toLocaleString()}</td>
                      <td>{new Date(o.validTo).toLocaleString()}</td>
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
