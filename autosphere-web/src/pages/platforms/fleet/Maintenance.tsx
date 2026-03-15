import { useI18n } from '../../../i18n/context'
import { api, type FleetMaintenanceItem } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import FleetScreen from './FleetScreen'
import './Maintenance.css'

export default function FleetMaintenance() {
  const { t } = useI18n()
  const { data: items = [], loading, error, refetch } = useApiData<FleetMaintenanceItem[]>(() => api.getFleetMaintenance())

  if (loading) {
    return (
      <FleetScreen title={t('fleet.maintenanceTitle')} subtitle={t('fleet.maintenanceSubtitle')}>
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </FleetScreen>
    )
  }

  return (
    <FleetScreen title={t('fleet.maintenanceTitle')} subtitle={t('fleet.maintenanceSubtitle')}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
      {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>}
      <section className="fleet-data-card card">
        <h3>{t('fleet.maintenanceTitle')}</h3>
        {items.length === 0 ? (
          <p className="fleet-empty">{t('fleet.noMaintenance')}</p>
        ) : (
          <ul className="fleet-maintenance-list">
            {items.map((m, i) => (
              <li key={m._id ?? m.id ?? i} className="fleet-maintenance-item">
                <span className="fleet-maint-plate">{m.vehiclePlate}</span>
                <span className="fleet-maint-type">{m.type}</span>
                <span className="fleet-maint-date">{m.date}</span>
                <span className="fleet-maint-desc">{m.description}</span>
                <span className={`fleet-badge fleet-badge-${m.status}`}>{m.status}</span>
                {m.cost != null && <span className="fleet-maint-cost">${m.cost}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </FleetScreen>
  )
}
