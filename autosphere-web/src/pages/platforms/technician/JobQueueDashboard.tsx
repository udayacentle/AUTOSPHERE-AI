import TechnicianScreen from './TechnicianScreen'
import { api, type TechnicianJobItem } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'

export default function JobQueueDashboard() {
  const { t } = useI18n()
  const { data: jobs = [], loading, error, refetch } = useApiData<TechnicianJobItem[]>(() =>
    api.getTechnicianJobs()
  )

  if (loading) {
    return (
      <TechnicianScreen title="Job Queue Dashboard" subtitle="Assigned jobs and repair queue">
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </TechnicianScreen>
    )
  }
  if (error) {
    return (
      <TechnicianScreen title="Job Queue Dashboard" subtitle="Assigned jobs and repair queue">
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </TechnicianScreen>
    )
  }

  const pending = jobs.filter((j) => j.status === 'pending')
  const inProgress = jobs.filter((j) => j.status === 'in_progress')
  const completed = jobs.filter((j) => j.status === 'completed')

  return (
    <TechnicianScreen title="Job Queue Dashboard" subtitle="Real jobs from fleet maintenance">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
      <div className="card-grid">
        <div className="card">
          <h3>Pending</h3>
          <p><strong>{pending.length}</strong></p>
        </div>
        <div className="card">
          <h3>In progress</h3>
          <p><strong>{inProgress.length}</strong></p>
        </div>
        <div className="card">
          <h3>Completed</h3>
          <p><strong>{completed.length}</strong></p>
        </div>
      </div>
      <section className="card" style={{ marginTop: '1rem' }}>
        <h3>Queue</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {jobs.map((j) => (
            <li key={j.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <strong>{j.vehiclePlate}</strong> · {j.type} · {j.status} · ~{j.estimatedMinutes} min
              {j.description && <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}> · {j.description}</span>}
            </li>
          ))}
        </ul>
        {jobs.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No jobs in queue.</p>}
      </section>
    </TechnicianScreen>
  )
}
