import { Link } from 'react-router-dom'
import DriverScreen from './DriverScreen'
import { api, type DriverLiveRepairData, type LiveRepairStepItem } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import './LiveRepair.css'

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

function getStepLabel(stepId: string, t: (k: string) => string): string {
  if (stepId === 'diagnosis') return t('liveRepair.diagnosis')
  if (stepId === 'repair') return t('liveRepair.repair')
  if (stepId === 'qc') return t('liveRepair.qualityCheck')
  return stepId
}

export default function LiveRepair() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<DriverLiveRepairData>(() => api.getDriverLiveRepair())
  const active = data?.active && data?.job
  const job = data?.job
  const progressPercent = job?.progressPercent ?? 0
  const lastUpdated = data?.lastUpdated || job?.lastUpdated

  if (loading) {
    return (
      <DriverScreen title={t('liveRepair.title')} subtitle={t('liveRepair.subtitle')}>
        <p className="live-repair-loading">…</p>
      </DriverScreen>
    )
  }

  if (error) {
    return (
      <DriverScreen title={t('liveRepair.title')} subtitle={t('liveRepair.subtitle')}>
        <div className="live-repair-error">{t('liveRepair.loadFailed')}</div>
      </DriverScreen>
    )
  }

  if (!active || !job) {
    return (
      <DriverScreen title={t('liveRepair.title')} subtitle={t('liveRepair.subtitle')}>
        <div className="live-repair-empty">
          <h3>{t('liveRepair.noActiveRepair')}</h3>
          <p>{t('liveRepair.noActiveDesc')}</p>
        </div>
      </DriverScreen>
    )
  }

  return (
    <DriverScreen title={t('liveRepair.title')} subtitle={t('liveRepair.subtitle')}>
      <div className="live-repair-page">
        <div className="live-repair-toolbar">
          {lastUpdated && (
            <span className="live-repair-last-updated">
              {t('liveRepair.lastUpdated')}: {formatDateTime(lastUpdated)}
            </span>
          )}
          <button type="button" className="live-repair-refresh-btn" onClick={() => refetch()} disabled={loading}>
            {loading ? '…' : t('liveRepair.refresh')}
          </button>
        </div>

        <div className="live-repair-status-card">
          <div className="live-repair-status-row">
            <h3>{t('liveRepair.currentStatus')}</h3>
            <span className={`live-repair-badge status-${(job.status || 'in_progress').toLowerCase()}`}>
              {job.status === 'completed' ? t('liveRepair.completed') : t('liveRepair.inProgress')}
            </span>
          </div>
          <div className="live-repair-progress-wrap">
              <span className="live-repair-progress-label">{t('liveRepair.progress')}</span>
              <div className="live-repair-progress-bar">
                <div className="live-repair-progress-fill" style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }} />
              </div>
              <span className="live-repair-progress-pct">{progressPercent}%</span>
            </div>
        </div>

        <div className="live-repair-meta">
          <p>
            <strong>{t('liveRepair.vehicle')}:</strong> {job.vehiclePlate}
          </p>
          <p>
            <strong>{job.type}</strong>
            {job.description && ` — ${job.description}`}
          </p>
          {job.cost != null && job.cost > 0 && (
            <p>
              <strong>{t('liveRepair.cost')}:</strong> ${job.cost.toLocaleString()}
            </p>
          )}
          <p>
            <strong>{t('liveRepair.technician')}:</strong>{' '}
            <Link to="technician-profile" className="live-repair-technician-link">
              {job.technicianName}
            </Link>
            <span className="live-repair-view-tech"> — {t('liveRepair.viewTechnician')}</span>
          </p>
        </div>

        {job.updates && job.updates.length > 0 && (
          <section className="live-repair-section">
            <h3>{t('liveRepair.updates')}</h3>
            <ul className="live-repair-updates">
              {job.updates.map((u) => (
                <li key={u.id}>
                  <span className="live-repair-update-time">{formatDateTime(u.at)}</span>
                  <span className="live-repair-update-text">{u.text}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="live-repair-section">
          <h3>{t('liveRepair.steps')}</h3>
          <ul className="live-repair-steps">
            {(job.steps || []).map((step: LiveRepairStepItem) => (
              <li
                key={step.id}
                className={`live-repair-step live-repair-step--${step.status}`}
              >
                <span className="live-repair-step-dot" />
                <div className="live-repair-step-body">
                  <span className="live-repair-step-name">{getStepLabel(step.id, t)}</span>
                  {step.completedAt && (
                    <span className="live-repair-step-date">{formatDateTime(step.completedAt)}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="live-repair-section">
          <h3>{t('liveRepair.estimatedTime')}</h3>
          <p className="live-repair-eta">
            {t('liveRepair.startedAt')}: {formatDateTime(job.startedAt)}
            <br />
            {t('liveRepair.etaCompletion')}: {formatDateTime(job.estimatedCompletion)}
            {job.estimatedMinutes > 0 && (
              <>
                <br />
                <span className="live-repair-minutes">~{job.estimatedMinutes} min</span>
              </>
            )}
          </p>
        </section>
      </div>
    </DriverScreen>
  )
}
