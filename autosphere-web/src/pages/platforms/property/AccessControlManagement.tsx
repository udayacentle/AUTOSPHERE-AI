import PropertyScreen from './PropertyScreen'
import './PropertySections.css'
import { api, type PropertyAccessControlData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_ACCESS_CONTROL } from './propertyFallbacks'

export default function AccessControlManagement() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<PropertyAccessControlData | null>(() =>
    api.getPropertyAccessControl()
  )
  const access = data ?? (error ? FALLBACK_ACCESS_CONTROL : null)

  if (loading && !access) {
    return (
      <PropertyScreen title="Access Control Management" subtitle="Manage who can access parking and chargers">
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </PropertyScreen>
    )
  }

  return (
    <PropertyScreen title="Access Control Management" subtitle="Manage who can access parking and chargers (real API)">
      {error && (
        <div className="property-offline-banner">
          <span>Showing sample data. Start backend for live data.</span>
          <button type="button" className="btn-refresh" onClick={() => refetch()}>Retry</button>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
      {access && (
        <>
          <section className="card">
            <h3>Access rules</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>By user, role, vehicle, subscription, or pass.</p>
            <div className="property-table-wrap">
              <table className="property-table">
                <thead>
                  <tr><th>Name</th><th>Type</th><th>Zones</th><th>Active</th></tr>
                </thead>
                <tbody>
                  {access.rules.map((r) => (
                    <tr key={r.id}>
                      <td>{r.name}</td>
                      <td>{r.type}</td>
                      <td>{r.access.join(', ')}</td>
                      <td>{r.active ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <div className="card-grid" style={{ marginTop: '1rem' }}>
            <div className="card">
              <h3>Allowlist</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {access.allowlist.map((a) => (
                  <li key={a.id} style={{ padding: '0.25rem 0' }}>{a.label}: <strong>{a.count}</strong></li>
                ))}
              </ul>
            </div>
            <div className="card">
              <h3>Blocklist</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {access.blocklist.map((b) => (
                  <li key={b.id} style={{ padding: '0.25rem 0' }}>{b.label}: <strong>{b.count}</strong></li>
                ))}
              </ul>
            </div>
          </div>
          <section className="card" style={{ marginTop: '1rem' }}>
            <h3>Recent audit log</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Gates, barriers, app-based access.</p>
            <div className="property-table-wrap">
              <table className="property-table">
                <thead>
                  <tr><th>Time</th><th>Action</th><th>Gate</th><th>Vehicle</th></tr>
                </thead>
                <tbody>
                  {access.recentLog.map((l, i) => (
                    <tr key={i}>
                      <td>{new Date(l.at).toLocaleString()}</td>
                      <td>{l.action}</td>
                      <td>{l.gateId}</td>
                      <td>{l.vehicleId}</td>
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
