import { useState, useEffect } from 'react'
import TechnicianScreen from './TechnicianScreen'
import './TechnicianSections.css'
import { api, type TechnicianJobItem, type TechnicianWorkflowData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_JOBS, FALLBACK_WORKFLOW } from './technicianFallbacks'

export default function RepairWorkflowTracker() {
  const { t } = useI18n()
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)

  const { data: jobsData } = useApiData<TechnicianJobItem[] | null>(() => api.getTechnicianJobs())
  const jobs = (Array.isArray(jobsData) && jobsData.length > 0 ? jobsData : []) as TechnicianJobItem[]
  const jobsOrFallback = jobs.length > 0 ? jobs : FALLBACK_JOBS
  const fetchWorkflow = () => api.getTechnicianWorkflow(selectedJobId || undefined)
  const { data: workflow, loading, error, refetch } = useApiData<TechnicianWorkflowData | null>(fetchWorkflow)
  const workflowDisplay = workflow ?? (error ? FALLBACK_WORKFLOW : null)

  useEffect(() => {
    if (jobsOrFallback.length > 0 && !selectedJobId) setSelectedJobId(jobsOrFallback[0].id)
  }, [jobsOrFallback, selectedJobId])

  useEffect(() => {
    refetch()
  }, [selectedJobId])

  const stages = workflowDisplay?.stages ?? []

  return (
    <TechnicianScreen title="Repair Workflow Tracker" subtitle="Track repair stages and time">
      {error && (
        <div className="tech-offline-banner" style={{ marginBottom: '1rem' }}>
          <span>Showing sample data. Start backend in <code>autosphere_full_production_monorepo/services/backend</code> for live data.</span>
          <button type="button" className="btn-refresh" onClick={() => refetch()}>Retry</button>
        </div>
      )}
      <div className="tech-section">
        {jobsOrFallback.length > 0 && (
          <label className="tech-select-label">
            Job
            <select
              className="tech-select"
              value={selectedJobId ?? ''}
              onChange={(e) => setSelectedJobId(e.target.value || null)}
            >
              {jobsOrFallback.map((j) => (
                <option key={j.id} value={j.id}>{j.vehiclePlate} · {j.type}</option>
              ))}
            </select>
          </label>
        )}
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
      {loading && stages.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>}
      {stages.length > 0 && (
        <>
          <section className="card">
            <h3>Workflow stages</h3>
            <p className="tech-workflow-desc">Diagnose → Parts → Repair → Test → Complete. Customer sees live status in driver app.</p>
            <div className="tech-workflow-stages">
              {stages.map((s) => (
                <div key={s.id} className={`tech-workflow-stage tech-workflow-stage--${s.status}`}>
                  <span className="tech-workflow-stage-name">{s.name}</span>
                  <span className="tech-workflow-stage-status">{s.status}</span>
                  <span className="tech-workflow-stage-time">
                    Est: {s.estimatedMin} min{s.actualMin != null ? ` · Actual: ${s.actualMin} min` : ''}
                  </span>
                </div>
              ))}
            </div>
          </section>
          <section className="card">
            <h3>Time per stage</h3>
            <div className="tech-table-wrap">
              <table className="tech-table">
                <thead>
                  <tr><th>Stage</th><th>Status</th><th>Est. (min)</th><th>Actual (min)</th></tr>
                </thead>
                <tbody>
                  {stages.map((s) => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>{s.status}</td>
                      <td>{s.estimatedMin}</td>
                      <td>{s.actualMin ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </TechnicianScreen>
  )
}
