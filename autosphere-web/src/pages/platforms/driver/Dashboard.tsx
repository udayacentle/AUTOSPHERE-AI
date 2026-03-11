import DriverScreen from './DriverScreen'
import { api, type DashboardData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'

export default function Dashboard() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<DashboardData>(() => api.getDashboard())

  if (loading) {
    return (
      <DriverScreen title={t('dashboard.title')} subtitle={t('dashboard.subtitle')}>
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </DriverScreen>
    )
  }
  if (error) {
    return (
      <DriverScreen title={t('dashboard.title')} subtitle={t('dashboard.subtitle')}>
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </DriverScreen>
    )
  }

  const formatDate = (d: string) => (d ? new Date(d).toLocaleDateString() : '—')
  const vehicleLabel = data?.vehicle ? `${data.vehicle.make} ${data.vehicle.model}` : '—'

  return (
    <DriverScreen title={t('dashboard.title')} subtitle={t('dashboard.subtitle')}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
      <div className="card-grid">
        <div className="card">
          <h3>{t('dashboard.mobilityScore')}</h3>
          <p>{data?.mobilityScore != null ? data.mobilityScore : '—'} / 100</p>
        </div>
        <div className="card">
          <h3>{t('dashboard.vehicleHealth')}</h3>
          <p>
            {vehicleLabel} — {data?.vehicle?.healthScore != null ? `${data.vehicle.healthScore}%` : '—'}
          </p>
        </div>
        <div className="card">
          <h3>{t('dashboard.recentTrips')}</h3>
          <p>
            {data?.recentTrips?.length
              ? `Last ${data.recentTrips.length} trip(s) · ${data.recentTrips.reduce((a, trip) => a + trip.distanceKm, 0)} km total`
              : t('dashboard.noTrips')}
          </p>
          {data?.recentTrips?.length ? (
            <ul style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {data.recentTrips.slice(0, 3).map((trip) => (
                <li key={trip.id}>
                  {trip.distanceKm} km · Score {trip.score}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="card">
          <h3>{t('dashboard.upcomingService')}</h3>
          <p>
            {data?.nextService
              ? `${data.nextService.type} — ${formatDate(data.nextService.date)}`
              : t('dashboard.noUpcomingService')}
          </p>
          {data?.nextService?.description && (
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {data.nextService.description}
            </p>
          )}
        </div>
        <div className="card">
          <h3>{t('dashboard.insurance')}</h3>
          <p>
            {data?.insurance
              ? `${data.insurance.provider} · Expires ${formatDate(data.insurance.expiryDate)}`
              : '—'}
          </p>
        </div>
        <div className="card">
          <h3>{t('dashboard.quickActions')}</h3>
          <p>Parking, charging, roadside</p>
        </div>
      </div>
    </DriverScreen>
  )
}
