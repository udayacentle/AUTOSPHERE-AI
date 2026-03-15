import { useI18n } from '../../../i18n/context'
import { api, type FleetReportItem } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import FleetScreen from './FleetScreen'
import './Reports.css'

export default function FleetReports() {
  const { t } = useI18n()
  const { data: reports = [], loading, error, refetch } = useApiData<FleetReportItem[]>(() => api.getFleetReports())

  if (loading) {
    return (
      <FleetScreen title={t('fleet.reportsTitle')} subtitle={t('fleet.reportsSubtitle')}>
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </FleetScreen>
    )
  }

  return (
    <FleetScreen title={t('fleet.reportsTitle')} subtitle={t('fleet.reportsSubtitle')}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
      {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>}
      <section className="fleet-data-card card">
        <h3>{t('fleet.reportsTitle')}</h3>
        {reports.length === 0 ? (
          <p className="fleet-empty">{t('fleet.noReports')}</p>
        ) : (
          <div className="fleet-reports-grid">
            {reports.map((r, i) => (
              <div key={r._id ?? r.id ?? i} className="fleet-report-card card">
                <h4 className="fleet-report-period">{r.period}</h4>
                <dl className="fleet-report-stats">
                  <dt>{t('fleet.trips')}</dt>
                  <dd>{r.totalTrips}</dd>
                  <dt>{t('fleet.totalDistance')}</dt>
                  <dd>{r.totalDistanceKm} km</dd>
                  <dt>{t('fleet.fuel')}</dt>
                  <dd>{r.totalFuelUsed}</dd>
                  <dt>{t('fleet.maintenance')}</dt>
                  <dd>{r.maintenanceCount}</dd>
                  <dt>{t('fleet.alerts')}</dt>
                  <dd>{r.alerts}</dd>
                </dl>
              </div>
            ))}
          </div>
        )}
      </section>
    </FleetScreen>
  )
}
