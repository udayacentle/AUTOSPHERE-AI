import { useI18n } from '../../../i18n/context'
import { api, type FleetDriverItem } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import FleetScreen from './FleetScreen'
import './Drivers.css'

export default function FleetDrivers() {
  const { t } = useI18n()
  const { data: drivers = [], loading, error, refetch } = useApiData<FleetDriverItem[]>(() => api.getFleetDrivers())

  if (loading) {
    return (
      <FleetScreen title={t('fleet.driversTitle')} subtitle={t('fleet.driversSubtitle')}>
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </FleetScreen>
    )
  }

  return (
    <FleetScreen title={t('fleet.driversTitle')} subtitle={t('fleet.driversSubtitle')}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
      {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>}
      <section className="fleet-data-card card">
        <h3>{t('fleet.driversTitle')}</h3>
        {drivers.length === 0 ? (
          <p className="fleet-empty">{t('fleet.noDrivers')}</p>
        ) : (
          <ul className="fleet-drivers-list">
            {drivers.map((d) => (
              <li key={d._id ?? d.id ?? d.licenseId} className="fleet-driver-item">
                <span className="fleet-driver-name">{d.name}</span>
                <span className="fleet-driver-meta">{d.licenseId}</span>
                <span className="fleet-driver-meta">{d.assignedVehiclePlate || '—'}</span>
                <span className={`fleet-badge fleet-badge-${d.status}`}>{d.status}</span>
                <span className="fleet-driver-meta">{d.contact}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </FleetScreen>
  )
}
