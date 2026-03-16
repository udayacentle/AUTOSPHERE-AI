import { useI18n } from '../../../i18n/context'
import { type FleetVehicleItem } from '../../../api/client'
import { useFleetVehicles } from '../../../contexts/FleetVehiclesContext'
import FleetScreen from './FleetScreen'
import './Tracking.css'

const FALLBACK_VEHICLES: FleetVehicleItem[] = [
  { plateNumber: 'AB-1234', model: 'Ford Transit', status: 'active', latitude: 37.77, longitude: -122.41 },
  { plateNumber: 'CD-5678', model: 'Mercedes Sprinter', status: 'active', latitude: 37.78, longitude: -122.40 },
  { plateNumber: 'EF-9012', model: 'Toyota Hiace', status: 'maintenance', latitude: null, longitude: null },
]

function dedupeByPlate<T extends { plateNumber?: string | null }>(list: T[]): T[] {
  const seen = new Set<string>()
  return list.filter((v) => {
    const plate = (v.plateNumber ?? '').trim().toLowerCase()
    if (!plate || seen.has(plate)) return false
    seen.add(plate)
    return true
  })
}

export default function Tracking() {
  const { t } = useI18n()
  const { vehicles: contextVehicles, loading, error, refetch } = useFleetVehicles()
  const raw = contextVehicles.length > 0 ? contextVehicles : (error ? FALLBACK_VEHICLES : [])
  const vehicles = dedupeByPlate(raw)

  if (loading) {
    return (
      <FleetScreen title={t('fleet.trackingTitle')} subtitle={t('fleet.trackingSubtitle')}>
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </FleetScreen>
    )
  }
  if (error) {
    return (
      <FleetScreen title={t('fleet.trackingTitle')} subtitle={t('fleet.trackingSubtitle')}>
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </FleetScreen>
    )
  }

  const withLocation = vehicles.filter((v) => v.latitude != null && v.longitude != null)
  const noLocation = vehicles.filter((v) => v.latitude == null || v.longitude == null)

  return (
    <FleetScreen title={t('fleet.trackingTitle')} subtitle={t('fleet.trackingSubtitle')}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>

      <div className="fleet-tracking-map-placeholder card">
        <p className="fleet-tracking-map-hint">{t('fleet.mapPlaceholder')}</p>
        {withLocation.length > 0 ? (
          <p className="fleet-tracking-map-count">
            {withLocation.length} {t('fleet.vehiclesWithLocation')}
          </p>
        ) : null}
      </div>

      <section className="fleet-tracking-list card">
        <h3>{t('fleet.liveLocations')}</h3>
        {withLocation.length === 0 && noLocation.length === 0 ? (
          <p className="fleet-empty">{t('fleet.noVehicles')}</p>
        ) : withLocation.length === 0 ? (
          <p className="fleet-empty">{t('fleet.noLocationsYet')}</p>
        ) : (
          <ul className="fleet-tracking-vehicles">
            {withLocation.map((v) => (
              <li key={v._id ?? v.id ?? v.plateNumber} className="fleet-tracking-item">
                <span className="fleet-vehicle-plate">{v.plateNumber}</span>
                <span className="fleet-vehicle-model">{v.model || '—'}</span>
                <span className="fleet-tracking-coords">
                  {v.latitude?.toFixed(4)}, {v.longitude?.toFixed(4)}
                </span>
                <a
                  href={`https://www.google.com/maps?q=${v.latitude},${v.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fleet-tracking-link"
                >
                  {t('fleet.viewOnMap')}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {noLocation.length > 0 && (
        <section className="fleet-tracking-list card">
          <h3>{t('fleet.noLocation')}</h3>
          <ul className="fleet-tracking-vehicles">
            {noLocation.map((v) => (
              <li key={v._id ?? v.id ?? v.plateNumber} className="fleet-tracking-item">
                <span className="fleet-vehicle-plate">{v.plateNumber}</span>
                <span className="fleet-vehicle-model">{v.model || '—'}</span>
                <span className="fleet-tracking-coords fleet-no-coords">—</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </FleetScreen>
  )
}
