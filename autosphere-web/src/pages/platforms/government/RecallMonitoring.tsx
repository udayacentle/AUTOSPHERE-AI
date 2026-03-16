import GovernmentScreen from './GovernmentScreen'
import { api, type GovernmentRecallsSummaryData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'

export default function RecallMonitoring() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<GovernmentRecallsSummaryData>(() =>
    api.getGovernmentRecallsSummary('Toyota', 2024)
  )

  if (loading) {
    return (
      <GovernmentScreen title="Recall Monitoring" subtitle="Track vehicle recalls (NHTSA API)">
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </GovernmentScreen>
    )
  }
  if (error) {
    return (
      <GovernmentScreen title="Recall Monitoring" subtitle="Track vehicle recalls (NHTSA API)">
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </GovernmentScreen>
    )
  }

  return (
    <GovernmentScreen title="Recall Monitoring" subtitle={`NHTSA recalls: ${data?.make ?? ''} ${data?.year ?? ''}`}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
      <div className="card-grid">
        <div className="card">
          <h3>Total recalls (sample)</h3>
          <p><strong>{data?.totalRecalls ?? 0}</strong> for {data?.make} {data?.year}</p>
        </div>
      </div>
      <section className="card" style={{ marginTop: '1rem' }}>
        <h3>Recent recalls (NHTSA)</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {(data?.recalls ?? []).map((r, i) => (
            <li key={i} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <strong>{r.Component}</strong>: {r.Summary || '—'}
            </li>
          ))}
        </ul>
        {(data?.recalls?.length ?? 0) === 0 && <p style={{ color: 'var(--text-secondary)' }}>No recalls in sample.</p>}
      </section>
    </GovernmentScreen>
  )
}
