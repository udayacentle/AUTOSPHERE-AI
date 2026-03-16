import { useMemo, useState } from 'react'
import DriverScreen from './DriverScreen'
import { api, type InsuranceClaimItem } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import './ClaimStatus.css'

const STATUS_FILTERS = ['all', 'submitted', 'assessing', 'approved', 'paid', 'rejected'] as const

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString(undefined, { dateStyle: 'medium' })
  } catch {
    return d
  }
}

function getStatusLabel(status: string, t: (k: string) => string): string {
  const s = (status || '').toLowerCase()
  if (s === 'submitted') return t('claimStatus.statusSubmitted')
  if (s === 'assessing') return t('claimStatus.statusAssessing')
  if (s === 'approved') return t('claimStatus.statusApproved')
  if (s === 'paid') return t('claimStatus.statusPaid')
  if (s === 'rejected') return t('claimStatus.statusRejected')
  return status
}

function getTimelineStepLabel(step: string, t: (k: string) => string): string {
  if (step === 'submitted') return t('claimStatus.timelineSubmitted')
  if (step === 'under_review') return t('claimStatus.timelineUnderReview')
  if (step === 'assessing') return t('claimStatus.timelineAssessment')
  if (step === 'resolved') return t('claimStatus.timelineResolved')
  return step
}

export default function ClaimStatus() {
  const { t } = useI18n()
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('all')
  const { data: claimsList, loading, error } = useApiData<InsuranceClaimItem[]>(() =>
    api.getDriverClaims()
  )
  const claims = claimsList ?? []

  const filteredClaims = useMemo(() => {
    if (statusFilter === 'all') return claims
    return claims.filter((c) => (c.status || '').toLowerCase() === statusFilter)
  }, [claims, statusFilter])

  return (
    <DriverScreen title={t('claimStatus.title')} subtitle={t('claimStatus.subtitle')}>
      <div className="claim-status-page">
        {error && (
          <div className="claim-status-banner claim-status-error">
            {t('claimStatus.loadFailed')}
          </div>
        )}

        <div className="claim-status-filters">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className={`claim-status-filter-btn ${statusFilter === f ? 'active' : ''}`}
              onClick={() => setStatusFilter(f)}
            >
              {t(`claimStatus.filter${f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}`)}
            </button>
          ))}
        </div>

        {loading && <p className="claim-status-loading">{t('claimStatus.lastUpdated')}…</p>}

        {!loading && filteredClaims.length === 0 && (
          <div className="claim-status-empty">{t('claimStatus.noClaims')}</div>
        )}

        <ul className="claim-status-list">
          {filteredClaims.map((claim) => (
            <li key={claim.id} className="claim-status-card">
              <div className="claim-status-card-header">
                <span className="claim-status-id">{claim.id}</span>
                <span className={`claim-status-badge status-${(claim.status || 'submitted').toLowerCase()}`}>
                  {getStatusLabel(claim.status, t)}
                </span>
              </div>
              <div className="claim-status-card-meta">
                <span>{t('claimStatus.date')}: {formatDate(claim.date)}</span>
                {claim.amount != null && claim.amount > 0 && (
                  <span>{t('claimStatus.amount')}: ${claim.amount.toLocaleString()}</span>
                )}
              </div>
              {claim.description && (
                <p className="claim-status-description">{claim.description}</p>
              )}
              {claim.damageType && (
                <p className="claim-status-damage-type">
                  {t('claimStatus.damageType')}: {claim.damageType}
                </p>
              )}
              {claim.affectedParts && claim.affectedParts.length > 0 && (
                <p className="claim-status-parts">
                  {t('claimStatus.affectedParts')}: {claim.affectedParts.join(', ')}
                </p>
              )}
              {claim.statusTimeline && claim.statusTimeline.length > 0 && (
                <div className="claim-status-timeline">
                  {claim.statusTimeline.map((item, idx) => (
                    <div
                      key={item.step}
                      className={`claim-status-timeline-step ${item.completed ? 'completed' : 'pending'}`}
                    >
                      <span className="claim-status-timeline-dot" />
                      <span className="claim-status-timeline-label">
                        {getTimelineStepLabel(item.step, t)}
                        {item.date && item.completed && (
                          <span className="claim-status-timeline-date"> — {formatDate(item.date)}</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </DriverScreen>
  )
}
