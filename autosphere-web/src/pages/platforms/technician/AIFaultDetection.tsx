import { useState, useEffect } from 'react'
import TechnicianScreen from './TechnicianScreen'
import './TechnicianSections.css'
import { api, type TechnicianJobItem, type TechnicianAiFaultsData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_JOBS, FALLBACK_AI_FAULTS } from './technicianFallbacks'

export default function AIFaultDetection() {
  const { t } = useI18n()
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)

  const { data: jobsData } = useApiData<TechnicianJobItem[] | null>(() => api.getTechnicianJobs())
  const jobs = (Array.isArray(jobsData) && jobsData.length > 0 ? jobsData : []) as TechnicianJobItem[]
  const jobsOrFallback = jobs.length > 0 ? jobs : FALLBACK_JOBS
  const fetchFaults = () => api.getTechnicianAiFaults(selectedJobId || undefined)
  const { data: faultsData, loading, error, refetch } = useApiData<TechnicianAiFaultsData | null>(fetchFaults)
  const faults = faultsData ?? (error ? FALLBACK_AI_FAULTS : null)

  useEffect(() => {
    if (jobsOrFallback.length > 0 && !selectedJobId) setSelectedJobId(jobsOrFallback[0].id)
  }, [jobsOrFallback, selectedJobId])

  useEffect(() => {
    refetch()
  }, [selectedJobId])

  return (
    <TechnicianScreen title="AI Fault Detection" subtitle="AI-suggested faults and root cause">
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
      {loading && !faults && <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>}
      {!loading && !faults && jobsOrFallback.length > 0 && <p style={{ color: 'var(--text-secondary)' }}>Select a job to view AI fault data.</p>}
      {faults && (
        <>
          <section className="card">
            <h3>Detected faults</h3>
            <div className="tech-table-wrap">
              <table className="tech-table">
                <thead>
                  <tr>
                    <th>Fault</th>
                    <th>Likely cause</th>
                    <th>Confidence</th>
                    <th>Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(faults.faults) ? faults.faults : []).length === 0 ? (
                    <tr><td colSpan={4} style={{ color: 'var(--text-secondary)' }}>No faults detected for this job.</td></tr>
                  ) : (Array.isArray(faults.faults) ? faults.faults : []).map((f, i) => (
                    <tr key={i}>
                      <td>{f.fault}</td>
                      <td>{f.cause}</td>
                      <td>{Math.round((f.confidence ?? 0) * 100)}%</td>
                      <td>{f.evidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className="card">
            <h3>Root cause</h3>
            <p><strong>Primary:</strong> {faults.rootCause?.primary ?? '—'}</p>
            {Array.isArray(faults.rootCause?.contributing) && faults.rootCause.contributing.length > 0 && (
              <p><strong>Contributing:</strong> {faults.rootCause.contributing.join('; ')}</p>
            )}
          </section>
          <section className="card">
            <h3>Similar cases</h3>
            <ul className="tech-list">
              {(Array.isArray(faults.similarCases) ? faults.similarCases : []).map((c, i) => (
                <li key={i}>
                  <strong>{c.caseId}</strong> ({c.vehiclePlate}): {c.summary} — {c.outcome}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </TechnicianScreen>
  )
}
