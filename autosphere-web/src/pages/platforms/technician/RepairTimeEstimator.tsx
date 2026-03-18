import { useState, useEffect, useMemo } from 'react'
import TechnicianScreen from './TechnicianScreen'
import './TechnicianSections.css'
import {
  api,
  type TechnicianJobItem,
  type TechnicianTimeEstimateData,
  type TechnicianWorkflowData,
  type TechnicianRepairRecommendationsData,
} from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_JOBS, FALLBACK_TIME_ESTIMATE } from './technicianFallbacks'

function formatEta(eta: string | null): string {
  if (!eta) return '—'
  try {
    return new Date(eta).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return eta
  }
}

function formatStartedAt(startedAt: string | null): string {
  if (!startedAt) return '—'
  try {
    return new Date(startedAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return startedAt
  }
}

function elapsedMinutes(startedAt: string | null): number | null {
  if (!startedAt) return null
  try {
    const start = new Date(startedAt).getTime()
    return Math.floor((Date.now() - start) / 60_000)
  } catch {
    return null
  }
}

export default function RepairTimeEstimator() {
  const { t } = useI18n()
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [manualActualMinutes, setManualActualMinutes] = useState<string>('')
  const [actionLoading, setActionLoading] = useState(false)
  const [, setTick] = useState(0)

  const { data: jobsData } = useApiData<TechnicianJobItem[] | null>(() => api.getTechnicianJobs())
  const jobs = (Array.isArray(jobsData) && jobsData.length > 0 ? jobsData : []) as TechnicianJobItem[]
  const jobsOrFallback = jobs.length > 0 ? jobs : FALLBACK_JOBS

  const fetchTime = () => api.getTechnicianTimeEstimate(selectedJobId || undefined)
  const { data: timeData, loading, error, refetch } = useApiData<TechnicianTimeEstimateData | null>(fetchTime)
  const timeDisplay = timeData ?? (error ? FALLBACK_TIME_ESTIMATE : null)

  const fetchWorkflow = () => api.getTechnicianWorkflow(selectedJobId || undefined)
  const { data: workflowData, refetch: refetchWorkflow } = useApiData<TechnicianWorkflowData | null>(fetchWorkflow)
  const workflow = workflowData ?? null

  const fetchRecs = () => api.getTechnicianRepairRecommendations(selectedJobId || undefined)
  const { data: recsData, refetch: refetchRecs } = useApiData<TechnicianRepairRecommendationsData | null>(fetchRecs)
  const recs = recsData ?? null

  useEffect(() => {
    if (jobsOrFallback.length > 0 && !selectedJobId) setSelectedJobId(jobsOrFallback[0].id)
  }, [jobsOrFallback, selectedJobId])

  useEffect(() => {
    refetch()
    refetchWorkflow()
    refetchRecs()
  }, [selectedJobId])

  const handleStartJob = async () => {
    if (!selectedJobId) return
    setActionLoading(true)
    try {
      await api.updateTechnicianTimeEstimate({ jobId: selectedJobId, action: 'start' })
      await refetch()
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateActual = async () => {
    const mins = parseInt(manualActualMinutes, 10)
    if (isNaN(mins) || mins < 0) return
    setActionLoading(true)
    try {
      await api.updateTechnicianTimeEstimate({ jobId: selectedJobId || undefined, action: 'update', actualMinutes: mins })
      setManualActualMinutes('')
      await refetch()
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(false)
    }
  }

  const handleComplete = async () => {
    const mins = parseInt(manualActualMinutes, 10)
    const actual = isNaN(mins) || mins < 0 ? (timeDisplay?.actualMinutes ?? elapsedMinutes(timeDisplay?.startedAt ?? null) ?? 0) : mins
    setActionLoading(true)
    try {
      await api.updateTechnicianTimeEstimate({ jobId: selectedJobId || undefined, action: 'complete', actualMinutes: actual })
      setManualActualMinutes('')
      await refetch()
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(false)
    }
  }

  const variance = useMemo(() => {
    if (!timeDisplay || timeDisplay.actualMinutes == null) return null
    const diff = timeDisplay.actualMinutes - timeDisplay.estimatedMinutes
    return { diff, under: diff < 0, over: diff > 0, onTime: diff === 0 }
  }, [timeDisplay])

  const elapsed = useMemo(() => (timeDisplay?.startedAt ? elapsedMinutes(timeDisplay.startedAt) : null), [timeDisplay?.startedAt])

  useEffect(() => {
    if (elapsed == null) return
    const id = setInterval(() => setTick((n) => n + 1), 60_000)
    return () => clearInterval(id)
  }, [elapsed])

  return (
    <TechnicianScreen title="Repair Time Estimator" subtitle="Estimate and track repair duration with real API">
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
        <button type="button" className="btn-refresh" onClick={() => refetch()} disabled={loading}>{t('common.refresh')}</button>
      </div>

      {loading && !timeDisplay && <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>}

      {timeDisplay && (
        <>
          <div className="card-grid tech-time-grid">
            <div className="card">
              <h3>Estimated time</h3>
              <p className="tech-time-value">{timeDisplay.estimatedMinutes} min</p>
              <p className="tech-time-desc">Diagnosis + repair + test (from repair recommendations)</p>
            </div>
            <div className="card">
              <h3>Actual time</h3>
              <p className="tech-time-value">
                {timeDisplay.actualMinutes != null ? `${timeDisplay.actualMinutes} min` : elapsed != null ? `${elapsed} min (elapsed)` : '—'}
              </p>
              <p className="tech-time-desc">Logged via Start / Update / Complete</p>
            </div>
            <div className="card">
              <h3>Customer ETA</h3>
              <p className="tech-time-value">{formatEta(timeDisplay.eta)}</p>
              <p className="tech-time-desc">Expected completion; notify driver when ready</p>
            </div>
            <div className="card">
              <h3>Started at</h3>
              <p className="tech-time-value">{formatStartedAt(timeDisplay.startedAt)}</p>
              <p className="tech-time-desc">Job start time (set by Start job)</p>
            </div>
          </div>

          {variance != null && (
            <section className="card" style={{ marginTop: '1rem' }}>
              <h3>Estimate vs actual</h3>
              <p>
                <span className={`tech-time-variance ${variance.under ? 'under' : variance.over ? 'over' : 'on-time'}`}>
                  {variance.onTime ? 'On time' : variance.under ? `${Math.abs(variance.diff)} min under estimate` : `${variance.diff} min over estimate`}
                </span>
              </p>
            </section>
          )}

          <section className="card" style={{ marginTop: '1rem' }}>
            <h3>Actions (real API)</h3>
            <p className="tech-time-desc">Start the job to set ETA, then log actual minutes or mark complete.</p>
            <div className="tech-time-actions">
              <button type="button" className="btn-refresh" onClick={handleStartJob} disabled={actionLoading || !!timeDisplay.startedAt}>
                {timeDisplay.startedAt ? 'Job started' : 'Start job'}
              </button>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Actual (min):</span>
                <input
                  type="number"
                  min={0}
                  value={manualActualMinutes}
                  onChange={(e) => setManualActualMinutes(e.target.value)}
                  placeholder="e.g. 45"
                />
              </label>
              <button type="button" className="btn-refresh" onClick={handleUpdateActual} disabled={actionLoading || !manualActualMinutes.trim()}>
                Update actual
              </button>
              <button type="button" className="btn-refresh" onClick={handleComplete} disabled={actionLoading}>
                Mark complete
              </button>
            </div>
          </section>

          {workflow?.stages?.length > 0 && (
            <section className="card" style={{ marginTop: '1rem' }}>
              <h3>Workflow stage times</h3>
              <p className="tech-time-desc">Per-stage estimate and actual from workflow API.</p>
              <div className="tech-table-wrap">
                <table className="tech-table tech-time-breakdown-table">
                  <thead>
                    <tr>
                      <th>Stage</th>
                      <th>Status</th>
                      <th>Est. (min)</th>
                      <th>Actual (min)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workflow.stages.map((s) => (
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
          )}

          {recs?.steps?.length > 0 && (
            <section className="card" style={{ marginTop: '1rem' }}>
              <h3>Procedure time breakdown</h3>
              <p className="tech-time-desc">From repair recommendations API. Total labour: {recs.labourMinutes} min.</p>
              <div className="tech-table-wrap">
                <table className="tech-table tech-time-breakdown-table">
                  <thead>
                    <tr>
                      <th>Step</th>
                      <th>Description</th>
                      <th>Duration (min)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recs.steps.map((s) => (
                      <tr key={s.order}>
                        <td>{s.name}</td>
                        <td>{s.description}</td>
                        <td>{s.durationMin}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </TechnicianScreen>
  )
}
