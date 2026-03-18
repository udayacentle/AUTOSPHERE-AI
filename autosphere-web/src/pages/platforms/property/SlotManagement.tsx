import PropertyScreen from './PropertyScreen'
import './PropertySections.css'
import { api, type PropertySlotsData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_SLOTS } from './propertyFallbacks'

export default function SlotManagement() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<PropertySlotsData | null>(() =>
    api.getPropertySlots()
  )
  const slotsData = data ?? (error ? FALLBACK_SLOTS : null)
  const slots = slotsData?.slots ?? []

  if (loading && !slotsData) {
    return (
      <PropertyScreen title="Slot Management" subtitle="Manage parking and EV charging slots">
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </PropertyScreen>
    )
  }

  return (
    <PropertyScreen title="Slot Management" subtitle="Manage parking and EV charging slots (real API)">
      {error && (
        <div className="property-offline-banner">
          <span>Showing sample data. Start backend for live data.</span>
          <button type="button" className="btn-refresh" onClick={() => refetch()}>Retry</button>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
      {slotsData && (
        <>
          <div className="card-grid">
            <div className="card">
              <h3>Total slots</h3>
              <p><strong>{slotsData.total}</strong></p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Parking + EV from API</p>
            </div>
            <div className="card">
              <h3>By type</h3>
              <p>Parking: <strong>{slots.filter((s) => s.type === 'parking').length}</strong></p>
              <p>EV: <strong>{slots.filter((s) => s.type === 'ev').length}</strong></p>
            </div>
          </div>
          <section className="card" style={{ marginTop: '1rem' }}>
            <h3>Slot list</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>ID, type, zone, status, reservation. Add/edit and bulk actions (API-ready).</p>
            <div className="property-table-wrap">
              <table className="property-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Zone</th>
                    <th>Status</th>
                    <th>Reserved until</th>
                    <th>Power (kW)</th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map((s) => (
                    <tr key={s.id}>
                      <td><code>{s.id}</code></td>
                      <td>{s.type}</td>
                      <td>{s.zoneId}</td>
                      <td>{s.status}</td>
                      <td>{s.reservedUntil ? new Date(s.reservedUntil).toLocaleString() : '—'}</td>
                      <td>{s.powerKw ?? '—'}</td>
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
