import { useState, useEffect } from 'react'
import DriverScreen from './DriverScreen'
import { api, type DrivingReportData, type DrivingReportTripItem } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import './DrivingReports.css'

const FALLBACK_WEEK: DrivingReportData = {
  totalTrips: 6,
  totalDistanceKm: 248,
  totalDurationMin: 372,
  avgScore: 87,
  bestScore: 92,
  worstScore: 82,
  period: 'Last 7 days',
  recentTrips: [],
}
const FALLBACK_MONTH: DrivingReportData = {
  totalTrips: 24,
  totalDistanceKm: 992,
  totalDurationMin: 1488,
  avgScore: 86,
  bestScore: 94,
  worstScore: 78,
  period: 'Last 30 days',
  recentTrips: [],
}

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString(undefined, { dateStyle: 'short' })
  } catch {
    return d
  }
}

export default function DrivingReports() {
  const { t } = useI18n()
  const [period, setPeriod] = useState<'week' | 'month'>('month')
  const { data, loading, error, refetch } = useApiData<DrivingReportData | null>(() =>
    api.getDrivingReports(period)
  )
  useEffect(() => {
    refetch()
  }, [period])

  const report = data ?? (error ? (period === 'week' ? FALLBACK_WEEK : FALLBACK_MONTH) : null)
  const recentTrips = report?.recentTrips ?? []

  if (loading) {
    return (
      <DriverScreen title={t('drivingReports.title')} subtitle={t('drivingReports.subtitle')}>
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </DriverScreen>
    )
  }

  return (
    <DriverScreen title={t('drivingReports.title')} subtitle={t('drivingReports.subtitle')}>
      <div className="driving-reports-header">
        <div>
          <button
            type="button"
            className={`driving-reports-period-btn ${period === 'week' ? 'driving-reports-period-btn--active' : ''}`}
            onClick={() => setPeriod('week')}
          >
            {t('drivingReports.weekly')}
          </button>
          <button
            type="button"
            className={`driving-reports-period-btn ${period === 'month' ? 'driving-reports-period-btn--active' : ''}`}
            onClick={() => setPeriod('month')}
          >
            {t('drivingReports.monthly')}
          </button>
        </div>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>
          {t('common.refresh')}
        </button>
      </div>
      {error && (
        <p className="driving-reports-sample-banner">{t('fleet.showingSampleData')}</p>
      )}
      {report ? (
        <>
          <div className="card-grid driving-reports-stats">
            <div className="card">
              <h3>{report.period}</h3>
              <p>{t('drivingReports.totalTrips')}: <strong>{report.totalTrips}</strong></p>
            </div>
            <div className="card">
              <h3>{t('drivingReports.distance')}</h3>
              <p><strong>{report.totalDistanceKm}</strong> km</p>
            </div>
            <div className="card">
              <h3>{t('drivingReports.duration')}</h3>
              <p><strong>{report.totalDurationMin ?? 0}</strong> min</p>
            </div>
            <div className="card">
              <h3>{t('drivingReports.avgScore')}</h3>
              <p><strong>{report.avgScore}</strong> / 100</p>
            </div>
            <div className="card">
              <h3>{t('drivingReports.bestScore')}</h3>
              <p><strong>{report.bestScore ?? report.avgScore}</strong></p>
            </div>
            <div className="card">
              <h3>{t('drivingReports.worstScore')}</h3>
              <p><strong>{report.worstScore ?? report.avgScore}</strong></p>
            </div>
          </div>
          {recentTrips.length > 0 && (
            <section className="card driving-reports-trips">
              <h3>{t('drivingReports.recentTrips')}</h3>
              <div className="driving-reports-trips-table-wrap">
                <table className="driving-reports-trips-table">
                  <thead>
                    <tr>
                      <th>{t('drivingReports.date')}</th>
                      <th>{t('drivingReports.route')}</th>
                      <th>{t('drivingReports.distance')}</th>
                      <th>{t('drivingReports.duration')}</th>
                      <th>{t('drivingReports.score')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTrips.map((trip: DrivingReportTripItem) => (
                      <tr key={trip.id}>
                        <td>{formatDate(trip.date)}</td>
                        <td>
                          {trip.startLocation && trip.endLocation
                            ? `${trip.startLocation} → ${trip.endLocation}`
                            : '—'}
                        </td>
                        <td>{trip.distanceKm} km</td>
                        <td>{trip.durationMin} min</td>
                        <td><strong>{trip.score}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          <div className="card">
            <h3>{t('drivingReports.export')}</h3>
            <p>{t('drivingReports.exportDesc')}</p>
          </div>
        </>
      ) : (
        <p style={{ color: 'var(--danger)' }}>{error ?? t('drivingReports.unableToLoad')}</p>
      )}
    </DriverScreen>
  )
}
