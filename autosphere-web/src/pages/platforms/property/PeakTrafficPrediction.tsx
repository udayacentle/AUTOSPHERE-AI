import PropertyScreen from './PropertyScreen'
import './PropertySections.css'
import { api, type PropertyPeakTrafficData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_PEAK_TRAFFIC } from './propertyFallbacks'

export default function PeakTrafficPrediction() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<PropertyPeakTrafficData | null>(() =>
    api.getPropertyPeakTraffic()
  )
  const peak = data ?? (error ? FALLBACK_PEAK_TRAFFIC : null)

  if (loading && !peak) {
    return (
      <PropertyScreen title="Peak Traffic Prediction" subtitle="AI-predicted demand and peak times">
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </PropertyScreen>
    )
  }

  return (
    <PropertyScreen title="Peak Traffic Prediction" subtitle="AI-predicted demand and peak times (real API)">
      {error && (
        <div className="property-offline-banner">
          <span>Showing sample data. Start backend for live data.</span>
          <button type="button" className="btn-refresh" onClick={() => refetch()}>Retry</button>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
      {peak && (
        <>
          <section className="card">
            <h3>Demand forecast</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Expected occupancy and charging demand by hour/day.</p>
            <div className="property-table-wrap">
              <table className="property-table">
                <thead>
                  <tr><th>Hour</th><th>Occupancy %</th><th>Charging demand (kW)</th></tr>
                </thead>
                <tbody>
                  {peak.forecast.map((f, i) => (
                    <tr key={i}>
                      <td>{f.hour}</td>
                      <td>{f.occupancyPercent}%</td>
                      <td>{f.chargingDemandKw}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className="card" style={{ marginTop: '1rem' }}>
            <h3>Peak windows</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Suggested peak periods; pricing recommendations.</p>
            <div className="property-table-wrap">
              <table className="property-table">
                <thead>
                  <tr><th>Start</th><th>End</th><th>Label</th><th>Suggested multiplier</th></tr>
                </thead>
                <tbody>
                  {peak.peakWindows.map((w, i) => (
                    <tr key={i}>
                      <td>{w.start}</td>
                      <td>{w.end}</td>
                      <td>{w.label}</td>
                      <td>{w.suggestedMultiplier}x</td>
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
