import { useI18n } from '../../../i18n/context'
import { api, type FleetActivityLogItem } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import FleetScreen from './FleetScreen'
import './FleetBrd.css'

export default function ActivityLog() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<FleetActivityLogItem[] | null>(() =>
    api.getFleetActivityLog(100)
  )
  const rows = Array.isArray(data) ? data : []

  return (
    <FleetScreen title={t('fleet.brdActivityTitle')} subtitle={t('fleet.brdActivitySubtitle')}>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        {t('fleet.brdActivityNote')}
      </p>
      <button type="button" className="btn-refresh" style={{ marginBottom: '1rem' }} onClick={() => refetch()}>
        {t('common.refresh')}
      </button>
      {loading ? (
        <p>{t('common.loading')}</p>
      ) : (
        <section className="card fleet-brd-card">
          <table className="fleet-brd-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Action</th>
                <th>Summary</th>
                <th>Actor</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id ?? r.id ?? r.summary}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                    {r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}
                  </td>
                  <td>
                    <code>{r.action}</code>
                  </td>
                  <td>{r.summary}</td>
                  <td>
                    <code>{r.actorUserId || '—'}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
      {error && rows.length === 0 && <p>{t('fleet.noData')}</p>}
    </FleetScreen>
  )
}
