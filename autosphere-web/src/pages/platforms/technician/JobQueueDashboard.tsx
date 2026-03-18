import TechnicianScreen from './TechnicianScreen'
import './TechnicianSections.css'
import { api, type TechnicianJobItem } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_JOBS } from './technicianFallbacks'

export default function JobQueueDashboard() {
  const { t } = useI18n()
  const { data: jobsData, loading, error, refetch } = useApiData<TechnicianJobItem[] | null>(() =>
    api.getTechnicianJobs()
  )
  const jobs = (Array.isArray(jobsData) && jobsData.length > 0 ? jobsData : error ? FALLBACK_JOBS : []) as TechnicianJobItem[]

  if (loading && jobs.length === 0) {
    return (
      <TechnicianScreen title="Job Queue Dashboard" subtitle="Assigned jobs and repair queue">
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </TechnicianScreen>
    )
  }

  const pending = jobs.filter((j) => j.status === 'pending')
  const inProgress = jobs.filter((j) => j.status === 'in_progress')
  const completed = jobs.filter((j) => j.status === 'completed')

  return (
    <TechnicianScreen title="Job Queue Dashboard" subtitle="Real jobs from fleet maintenance">
      {error && (
        <div className="tech-offline-banner" style={{ marginBottom: '1rem' }}>
          <span>Showing sample data. Start backend in <code>autosphere_full_production_monorepo/services/backend</code> for live data.</span>
          <button type="button" className="btn-refresh" onClick={() => refetch()}>Retry</button>
        </div>
      )}
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
