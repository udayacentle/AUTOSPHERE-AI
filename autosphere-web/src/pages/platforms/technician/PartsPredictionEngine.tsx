import { useState, useEffect } from 'react'
import TechnicianScreen from './TechnicianScreen'
import './TechnicianSections.css'
import { api, type TechnicianJobItem, type TechnicianPartsPredictionData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_JOBS, FALLBACK_PARTS } from './technicianFallbacks'

export default function PartsPredictionEngine() {
  const { t } = useI18n()
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)

  const { data: jobsData } = useApiData<TechnicianJobItem[] | null>(() => api.getTechnicianJobs())
  const jobs = (Array.isArray(jobsData) && jobsData.length > 0 ? jobsData : []) as TechnicianJobItem[]
  const jobsOrFallback = jobs.length > 0 ? jobs : FALLBACK_JOBS
  const fetchParts = () => api.getTechnicianPartsPrediction(selectedJobId || undefined)
  const { data: partsData, loading, error, refetch } = useApiData<TechnicianPartsPredictionData | null>(fetchParts)
  const partsDisplay = partsData ?? (error ? FALLBACK_PARTS : null)

  useEffect(() => {
    if (jobsOrFallback.length > 0 && !selectedJobId) setSelectedJobId(jobsOrFallback[0].id)
  }, [jobsOrFallback, selectedJobId])

  useEffect(() => {
    refetch()
  }, [selectedJobId])

  return (
    <TechnicianScreen title="Parts Prediction Engine" subtitle="AI-predicted parts needed for the repair">
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
      {loading && !partsDisplay && <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>}
      {partsDisplay && (
        <>
          <section className="card">
            <h3>Predicted parts</h3>
            <div className="tech-table-wrap">
              <table className="tech-table">
                <thead>
                  <tr><th>Part</th><th>Part #</th><th>Qty</th><th>In stock</th><th>Unit price</th></tr>
                </thead>
                <tbody>
                  {(Array.isArray(partsDisplay.predicted) ? partsDisplay.predicted : []).map((p, i) => (
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
            <h3>Stock check</h3>
            <div className="tech-table-wrap">
              <table className="tech-table">
                <thead>
                  <tr><th>Part</th><th>Part #</th><th>Qty</th><th>Location</th></tr>
                </thead>
                <tbody>
                  {(Array.isArray(partsDisplay.stock) ? partsDisplay.stock : []).map((s, i) => (
                    <tr key={i}>
                      <td>{s.name}</td>
                      <td><code>{s.partNumber}</code></td>
                      <td>{s.quantity}</td>
                      <td>{s.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className="card">
            <h3>Alternatives (OEM vs aftermarket)</h3>
            <div className="tech-table-wrap">
              <table className="tech-table">
                <thead>
                  <tr><th>Part #</th><th>Name</th><th>OEM #</th><th>Aftermarket</th></tr>
                </thead>
                <tbody>
                  {(Array.isArray(partsDisplay.alternatives) ? partsDisplay.alternatives : []).map((a, i) => (
                    <tr key={i}>
                      <td><code>{a.partNumber}</code></td>
                      <td>{a.name}</td>
                      <td>{a.oemPartNumber}</td>
                      <td>{a.aftermarket ? 'Yes' : 'No'}</td>
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
