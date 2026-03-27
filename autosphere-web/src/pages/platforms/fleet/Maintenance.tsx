import { useState } from 'react'
import { useI18n } from '../../../i18n/context'
import { api, type FleetMaintenanceItem } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import FleetScreen from './FleetScreen'
import './Maintenance.css'

export default function FleetMaintenance() {
  const { t } = useI18n()
  const { data: items = [], loading, error, refetch } = useApiData<FleetMaintenanceItem[]>(() => api.getFleetMaintenance())
  const [plate, setPlate] = useState('')
  const [svcType, setSvcType] = useState('')
  const [svcDate, setSvcDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [svcDesc, setSvcDesc] = useState('')
  const [svcStatus, setSvcStatus] = useState('scheduled')
  const [svcCost, setSvcCost] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  async function handleAddMaintenance(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!plate.trim()) {
      setFormError(t('fleet.plateRequired'))
      return
    }
    setSubmitting(true)
    try {
      await api.createFleetMaintenance({
        vehiclePlate: plate.trim(),
        type: svcType.trim() || 'Service',
        date: svcDate,
        description: svcDesc.trim(),
        status: svcStatus,
        cost: svcCost.trim() === '' ? null : Number(svcCost),
      })
      setPlate('')
      setSvcType('')
      setSvcDesc('')
      setSvcCost('')
      await refetch()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t('fleet.addFailed'))
    } finally {
      setSubmitting(false)
    }
  }

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
      <section className="fleet-data-card card" style={{ marginBottom: '1rem' }}>
        <h3>{t('fleet.maintenanceAddTitle')}</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          {t('fleet.maintenanceAddHint')}
        </p>
        <form onSubmit={handleAddMaintenance} className="fleet-maintenance-form">
          <div className="fleet-maintenance-form-row">
            <label>
              {t('fleet.plateNumber')}
              <input
                type="text"
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                placeholder={t('fleet.plateNumberPlaceholder')}
                required
              />
            </label>
            <label>
              {t('fleet.maintenanceTypeLabel')}
              <input
                type="text"
                value={svcType}
                onChange={(e) => setSvcType(e.target.value)}
                placeholder={t('fleet.maintenanceTypePlaceholder')}
              />
            </label>
          </div>
          <div className="fleet-maintenance-form-row">
            <label>
              {t('fleet.date')}
              <input type="date" value={svcDate} onChange={(e) => setSvcDate(e.target.value)} required />
            </label>
            <label>
              {t('fleet.status')}
              <select value={svcStatus} onChange={(e) => setSvcStatus(e.target.value)}>
                <option value="scheduled">{t('fleet.maintenanceStatusScheduled')}</option>
                <option value="pending">{t('fleet.maintenanceStatusPending')}</option>
                <option value="in_progress">{t('fleet.maintenanceStatusInProgress')}</option>
                <option value="completed">{t('fleet.maintenanceStatusCompleted')}</option>
              </select>
            </label>
          </div>
          <label style={{ display: 'block', marginBottom: '0.75rem' }}>
            {t('fleet.maintenanceDescriptionLabel')}
            <input
              type="text"
              value={svcDesc}
              onChange={(e) => setSvcDesc(e.target.value)}
              placeholder={t('fleet.maintenanceDescriptionPlaceholder')}
              style={{ width: '100%', maxWidth: 480, marginTop: 4 }}
            />
          </label>
          <label style={{ display: 'block', marginBottom: '0.75rem' }}>
            {t('fleet.maintenanceCostLabel')}
            <input
              type="number"
              min={0}
              step="0.01"
              value={svcCost}
              onChange={(e) => setSvcCost(e.target.value)}
              placeholder="0.00"
              style={{ width: 140, marginTop: 4 }}
            />
          </label>
          {formError && <p style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>{formError}</p>}
          <button type="submit" className="btn-refresh" disabled={submitting}>
            {submitting ? t('fleet.adding') : t('fleet.submitMaintenance')}
          </button>
        </form>
      </section>
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
