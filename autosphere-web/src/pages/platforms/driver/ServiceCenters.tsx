import DriverScreen from './DriverScreen'
import { api, type ServiceCenterItem } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'

export default function ServiceCenters() {
  const { t } = useI18n()
  const { data: centers = [], loading, error, refetch } = useApiData<ServiceCenterItem[]>(() =>
    api.getServiceCenters(37.77, -122.41)
  )

  if (loading) {
    return (
      <DriverScreen title="Nearby Service Centers & Booking" subtitle="Find and book workshops">
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </DriverScreen>
    )
  }
  if (error) {
    return (
      <DriverScreen title="Nearby Service Centers & Booking" subtitle="Find and book workshops">
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>
          {t('common.refresh')}
        </button>
      </DriverScreen>
    )
  }

  return (
    <DriverScreen title="Nearby Service Centers & Booking" subtitle="Real-world workshops (San Francisco area)">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>
          {t('common.refresh')}
        </button>
      </div>
      <div className="card-grid">
        {centers.map((s) => (
          <div key={s.id} className="card">
            <h3>{s.name}</h3>
            <p>{s.address}</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              ★ {s.rating} · {s.distanceKm != null ? `${s.distanceKm} km` : '—'} · {s.phone}
            </p>
            <a
              href={`https://www.google.com/maps?q=${s.lat},${s.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '0.9rem' }}
            >
              View on map
            </a>
          </div>
        ))}
      </div>
    </DriverScreen>
  )
}
