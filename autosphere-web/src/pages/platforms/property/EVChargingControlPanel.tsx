import PropertyScreen from './PropertyScreen'
import './PropertySections.css'
import { api, type PropertyEvChargingData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_EV_CHARGING } from './propertyFallbacks'

export default function EVChargingControlPanel() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<PropertyEvChargingData | null>(() =>
    api.getPropertyEvCharging()
  )
  const ev = data ?? (error ? FALLBACK_EV_CHARGING : null)

  if (loading && !ev) {
    return (
      <PropertyScreen title="EV Charging Control Panel" subtitle="Monitor and control EV charging stations">
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </PropertyScreen>
    )
  }

  return (
    <PropertyScreen title="EV Charging Control Panel" subtitle="Monitor and control EV charging stations (real API)">
      {error && (
        <div className="property-offline-banner">
          <span>Showing sample data. Start backend for live data.</span>
          <button type="button" className="btn-refresh" onClick={() => refetch()}>Retry</button>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
      {ev && (
        <>
          <div className="card-grid">
            <div className="card">
              <h3>Sessions today</h3>
              <p><strong>{ev.totalSessionsToday}</strong></p>
            </div>
            <div className="card">
              <h3>kWh today</h3>
              <p><strong>{ev.totalKwhToday}</strong> kWh</p>
            </div>
          </div>
          <section className="card" style={{ marginTop: '1rem' }}>
            <h3>Station status</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>All chargers: available, in use, fault, offline. Remote control (API-ready).</p>
            <div className="property-table-wrap">
              <table className="property-table">
                <thead>
                  <tr><th>Station</th><th>Name</th><th>Connectors</th><th>Available</th><th>In use</th><th>Power (kW)</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {ev.stations.map((s) => (
                    <tr key={s.id}>
                      <td><code>{s.id}</code></td>
                      <td>{s.name}</td>
                      <td>{s.connectors}</td>
                      <td>{s.available}</td>
                      <td>{s.inUse}</td>
                      <td>{s.powerKw}</td>
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
