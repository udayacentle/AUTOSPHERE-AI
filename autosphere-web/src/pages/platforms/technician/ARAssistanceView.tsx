import { useState, useEffect } from 'react'
import TechnicianScreen from './TechnicianScreen'
import './TechnicianSections.css'
import { api, type TechnicianJobItem, type TechnicianArStep } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_JOBS, FALLBACK_AR_STEPS } from './technicianFallbacks'

export default function ARAssistanceView() {
  const { t } = useI18n()
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)

  const { data: jobsData } = useApiData<TechnicianJobItem[] | null>(() => api.getTechnicianJobs())
  const jobs = (Array.isArray(jobsData) && jobsData.length > 0 ? jobsData : []) as TechnicianJobItem[]
  const jobsOrFallback = jobs.length > 0 ? jobs : FALLBACK_JOBS
  const fetchAr = () => api.getTechnicianArSteps(selectedJobId || undefined)
  const { data: arData, loading, error, refetch } = useApiData<{ steps: TechnicianArStep[] } | null>(fetchAr)
  const steps = (arData?.steps?.length ? arData.steps : error ? FALLBACK_AR_STEPS : []) as TechnicianArStep[]
  const hasSteps = steps.length > 0

  useEffect(() => {
    if (jobsOrFallback.length > 0 && !selectedJobId) setSelectedJobId(jobsOrFallback[0].id)
  }, [jobsOrFallback, selectedJobId])

  useEffect(() => {
    refetch()
  }, [selectedJobId])

  return (
    <TechnicianScreen title="AR Assistance View" subtitle="Augmented reality guidance for repairs">
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
      {loading && !hasSteps && <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>}
      {hasSteps && (
        <>
          <section className="card">
            <h3>AR overlay</h3>
            <p>Step-by-step overlay on engine bay or component. Use tablet or AR glasses; camera feed + overlay.</p>
          </section>
          <section className="card">
            <h3>Highlight & annotate</h3>
            <p>Point to bolts, connectors, and removal order.</p>
            <ol className="tech-ar-steps">
              {steps.map((s) => (
                <li key={s.order} className="tech-ar-step">
                  <strong>{s.title}</strong>
                  <p>{s.instruction}</p>
                  {s.highlightComponent && (
                    <span className="tech-ar-component">Component: <code>{s.highlightComponent}</code></span>
                  )}
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
    </TechnicianScreen>
  )
}
