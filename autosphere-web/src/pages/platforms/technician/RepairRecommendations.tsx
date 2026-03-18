import { useState, useEffect } from 'react'
import TechnicianScreen from './TechnicianScreen'
import './TechnicianSections.css'
import { api, type TechnicianJobItem, type TechnicianRepairRecommendationsData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_JOBS, FALLBACK_REPAIR_RECS } from './technicianFallbacks'

export default function RepairRecommendations() {
  const { t } = useI18n()
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)

  const { data: jobsData } = useApiData<TechnicianJobItem[] | null>(() => api.getTechnicianJobs())
  const jobs = (Array.isArray(jobsData) && jobsData.length > 0 ? jobsData : []) as TechnicianJobItem[]
  const jobsOrFallback = jobs.length > 0 ? jobs : FALLBACK_JOBS
  const fetchRecs = () => api.getTechnicianRepairRecommendations(selectedJobId || undefined)
  const { data: recs, loading, error, refetch } = useApiData<TechnicianRepairRecommendationsData | null>(fetchRecs)
  const recsDisplay = recs ?? (error ? FALLBACK_REPAIR_RECS : null)

  useEffect(() => {
    if (jobsOrFallback.length > 0 && !selectedJobId) setSelectedJobId(jobsOrFallback[0].id)
  }, [jobsOrFallback, selectedJobId])

  useEffect(() => {
    refetch()
  }, [selectedJobId])

  return (
    <TechnicianScreen title="Repair Recommendations" subtitle="Suggested repair steps and procedures">
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
      {loading && !recsDisplay && <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>}
      {recsDisplay && (
        <>
          <section className="card">
            <h3>Procedure steps</h3>
            <ol className="tech-steps">
              {(Array.isArray(recsDisplay.steps) ? recsDisplay.steps : []).map((s) => (
                <li key={s.order}>
                  <strong>{s.name}</strong> — {s.description} (~{s.durationMin} min)
                </li>
              ))}
            </ol>
          </section>
          <section className="card">
            <h3>Parts & labour</h3>
            <p>Estimated labour: <strong>{recsDisplay.labourMinutes} min</strong></p>
            <div className="tech-table-wrap">
              <table className="tech-table">
                <thead>
                  <tr><th>Part</th><th>Part #</th><th>Qty</th><th>Stock</th><th>Price</th></tr>
                </thead>
                <tbody>
                  {(Array.isArray(recsDisplay.parts) ? recsDisplay.parts : []).map((p, i) => (
                    <tr key={i}>
                      <td>{p.name}</td>
                      <td><code>{p.partNumber}</code></td>
                      <td>{p.quantity}</td>
                      <td>{p.inStock ? 'Yes' : 'No'}</td>
                      <td>${p.unitPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className="card">
            <h3>Manual links</h3>
            <ul className="tech-list">
              {(Array.isArray(recsDisplay.manualLinks) ? recsDisplay.manualLinks : []).map((l, i) => (
                <li key={i}><a href={l.url} target="_blank" rel="noopener noreferrer">{l.title}</a></li>
              ))}
            </ul>
          </section>
        </>
      )}
    </TechnicianScreen>
  )
}
