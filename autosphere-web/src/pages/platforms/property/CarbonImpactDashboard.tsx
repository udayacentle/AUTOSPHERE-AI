import PropertyScreen from './PropertyScreen'
import './PropertySections.css'
import { api, type PropertyCarbonImpactData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_CARBON_IMPACT } from './propertyFallbacks'

export default function CarbonImpactDashboard() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<PropertyCarbonImpactData | null>(() =>
    api.getPropertyCarbonImpact()
  )
  const carbon = data ?? (error ? FALLBACK_CARBON_IMPACT : null)

  if (loading && !carbon) {
    return (
      <PropertyScreen title="Carbon Impact Dashboard" subtitle="Carbon savings from EV charging and parking">
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </PropertyScreen>
    )
  }

  return (
    <PropertyScreen title="Carbon Impact Dashboard" subtitle="Carbon savings from EV charging and parking (real API)">
      {error && (
        <div className="property-offline-banner">
          <span>Showing sample data. Start backend for live data.</span>
          <button type="button" className="btn-refresh" onClick={() => refetch()}>Retry</button>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
      {carbon && (
        <>
          <div className="card-grid">
            <div className="card">
              <h3>kWh delivered today</h3>
              <p><strong>{carbon.kwhDeliveredToday}</strong> kWh</p>
            </div>
            <div className="card">
              <h3>kWh delivered (month)</h3>
              <p><strong>{carbon.kwhDeliveredMonth}</strong> kWh</p>
            </div>
            <div className="card">
              <h3>CO₂ avoided (month)</h3>
              <p><strong>{carbon.co2AvoidedKgMonth}</strong> kg</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Equivalent vs ICE</p>
            </div>
            <div className="card">
              <h3>Equivalent ICE distance</h3>
              <p><strong>{carbon.equivalentIceKm.toLocaleString()}</strong> km</p>
            </div>
          </div>
          <section className="card" style={{ marginTop: '1rem' }}>
            <h3>Trend</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Daily, monthly carbon impact; goals. Export for ESG reports (API-ready).</p>
            <div className="property-table-wrap">
              <table className="property-table">
                <thead>
                  <tr><th>Month</th><th>kWh</th><th>CO₂ avoided (kg)</th></tr>
                </thead>
                <tbody>
                  {carbon.trend.map((row, i) => (
                    <tr key={i}>
                      <td>{row.month}</td>
                      <td>{row.kwh}</td>
                      <td>{row.co2Kg}</td>
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
