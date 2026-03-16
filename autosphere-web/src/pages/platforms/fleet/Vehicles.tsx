import { useState } from 'react'
import { useI18n } from '../../../i18n/context'
import { api, type FleetVehicleItem } from '../../../api/client'
import { useFleetVehicles } from '../../../contexts/FleetVehiclesContext'
import FleetScreen from './FleetScreen'
import './Vehicles.css'

const FALLBACK_VEHICLES: FleetVehicleItem[] = [
  { plateNumber: 'AB-1234', model: 'Ford Transit', status: 'active' },
  { plateNumber: 'CD-5678', model: 'Mercedes Sprinter', status: 'active' },
  { plateNumber: 'EF-9012', model: 'Toyota Hiace', status: 'maintenance' },
]

export default function Vehicles() {
  const { t } = useI18n()
  const { vehicles: contextVehicles, loading, error, refetch } = useFleetVehicles()
  const raw = contextVehicles.length > 0 ? contextVehicles : (error ? FALLBACK_VEHICLES : [])
  const vehicles = raw.filter((v, i, arr) => arr.findIndex((x) => (x.plateNumber || '').toLowerCase() === (v.plateNumber || '').toLowerCase()) === i)
  const [plateNumber, setPlateNumber] = useState('')
  const [model, setModel] = useState('')
  const [status, setStatus] = useState('active')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddError('')
    const plate = plateNumber.trim()
    if (!plate) {
      setAddError(t('fleet.plateRequired'))
      return
    }
    setAdding(true)
    try {
      await api.addFleetVehicle({ plateNumber: plate, model: model.trim() || undefined, status })
      setPlateNumber('')
      setModel('')
      refetch()
    } catch (err) {
      setAddError(err instanceof Error ? err.message : t('fleet.addFailed'))
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <FleetScreen title={t('fleet.vehiclesTitle')} subtitle={t('fleet.vehiclesSubtitle')}>
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </FleetScreen>
    )
  }
  return (
    <FleetScreen title={t('fleet.vehiclesTitle')} subtitle={t('fleet.vehiclesSubtitle')}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
      {error && (
        <p className="fleet-offline-banner" style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: 8 }}>
          {t('fleet.showingSampleData')}
        </p>
      )}
      <section className="fleet-add-vehicle card">
        <h3>{t('fleet.addVehicle')}</h3>
        <form onSubmit={handleAdd} className="fleet-add-form">
          <label>
            <span>{t('fleet.plateNumber')} <span className="fleet-required-asterisk">*</span></span>
            <input
              type="text"
              value={plateNumber}
              onChange={(e) => { setPlateNumber(e.target.value); setAddError('') }}
              placeholder={t('fleet.plateNumberPlaceholder')}
              aria-label={t('fleet.plateNumber')}
            />
          </label>
          <label>
            <span>{t('fleet.model')}</span>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={t('fleet.modelPlaceholder')}
              aria-label={t('fleet.model')}
            />
          </label>
          <label>
            <span>{t('fleet.status')}</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">{t('fleet.statusActive')}</option>
              <option value="maintenance">{t('fleet.statusMaintenance')}</option>
              <option value="inactive">{t('fleet.statusInactive')}</option>
            </select>
          </label>
          {addError && <p className="fleet-add-error">{addError}</p>}
          <button type="submit" className="btn-primary" disabled={adding}>
            {adding ? t('fleet.adding') : t('fleet.addVehicle')}
          </button>
        </form>
      </section>

      <section className="fleet-vehicle-list card">
        <h3>{t('fleet.vehicleList')} ({vehicles.length})</h3>
        <ul className="fleet-vehicles">
          {vehicles.length === 0 ? (
            <li className="fleet-empty">{t('fleet.noVehicles')}</li>
          ) : (
            vehicles.map((v) => (
              <li key={v._id ?? v.id ?? v.plateNumber} className="fleet-vehicle-item">
                <span className="fleet-vehicle-plate">{v.plateNumber}</span>
                <span className="fleet-vehicle-model">{v.model || '—'}</span>
                <span className={`fleet-vehicle-status fleet-status-${v.status}`}>{v.status}</span>
              </li>
            ))
          )}
        </ul>
      </section>
    </FleetScreen>
  )
}
