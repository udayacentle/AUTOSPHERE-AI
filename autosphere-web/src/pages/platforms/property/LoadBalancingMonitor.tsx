import PropertyScreen from './PropertyScreen'
import './PropertySections.css'
import { api, type PropertyLoadBalancingData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_LOAD_BALANCING } from './propertyFallbacks'

export default function LoadBalancingMonitor() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<PropertyLoadBalancingData | null>(() =>
    api.getPropertyLoadBalancing()
  )
  const load = data ?? (error ? FALLBACK_LOAD_BALANCING : null)

  if (loading && !load) {
    return (
      <PropertyScreen title="Load Balancing Monitor" subtitle="Electrical load and grid balance across chargers">
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </PropertyScreen>
    )
  }

  return (
    <PropertyScreen title="Load Balancing Monitor" subtitle="Electrical load and grid balance across chargers (real API)">
      {error && (
        <div className="property-offline-banner">
          <span>Showing sample data. Start backend for live data.</span>
          <button type="button" className="btn-refresh" onClick={() => refetch()}>Retry</button>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
      {load && (
        <>
          <div className="card-grid">
            <div className="card">
              <h3>Total draw</h3>
              <p><strong>{load.totalDrawKw}</strong> kW</p>
            </div>
            <div className="card">
              <h3>Capacity</h3>
              <p><strong>{load.capacityKw}</strong> kW</p>
            </div>
            <div className="card">
              <h3>Utilization</h3>
              <p><strong>{load.utilizationPercent}%</strong></p>
              <div style={{ marginTop: '0.5rem', height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(load.utilizationPercent, 100)}%`, height: '100%', background: load.utilizationPercent > 80 ? 'var(--danger)' : load.utilizationPercent > 60 ? 'var(--warning)' : 'var(--success)' }} />
              </div>
            </div>
          </div>
          <section className="card" style={{ marginTop: '1rem' }}>
            <h3>Load by station</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Throttle or queue sessions to stay within limit. Alerts: {load.alerts?.length ? load.alerts.length : 0}.</p>
            <div className="property-table-wrap">
              <table className="property-table">
                <thead>
                  <tr><th>Station</th><th>Draw (kW)</th><th>Capacity (kW)</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {load.byStation.map((s) => (
                    <tr key={s.stationId}>
                      <td><code>{s.stationId}</code></td>
                      <td>{s.drawKw}</td>
                      <td>{s.capacityKw}</td>
                      <td>{s.status}</td>
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
