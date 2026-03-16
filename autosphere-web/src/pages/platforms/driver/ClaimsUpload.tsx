import { useState } from 'react'
import DriverScreen from './DriverScreen'
import {
  api,
  type DamageAssessmentResult,
  type InsuranceClaimItem,
} from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import './ClaimsUpload.css'

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString(undefined, { dateStyle: 'medium' })
  } catch {
    return d
  }
}

export default function ClaimsUpload() {
  const { t } = useI18n()
  const { data: claimsList, loading, error, refetch } = useApiData<InsuranceClaimItem[]>(() =>
    api.getDriverClaims()
  )
  const claims = claimsList ?? []

  const [description, setDescription] = useState('')
  const [assessment, setAssessment] = useState<DamageAssessmentResult | null>(null)
  const [assessing, setAssessing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleAssess = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setAssessing(true)
    setAssessment(null)
    try {
      const result = await api.submitDamageAssessment({ description: description || 'Vehicle damage' })
      setAssessment(result)
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : t('claimsUpload.assessFailed') })
    } finally {
      setAssessing(false)
    }
  }

  const handleSubmitClaim = async () => {
    if (!description.trim()) {
      setMessage({ type: 'error', text: t('claimsUpload.enterDescription') })
      return
    }
    setMessage(null)
    setSubmitting(true)
    try {
      const res = await api.submitClaim({
        description: description.trim(),
        assessmentId: assessment?.assessmentId,
        estimatedCost: assessment?.estimatedCost,
        damageType: assessment?.damageType,
        affectedParts: assessment?.affectedParts,
      })
      if (res.success && res.claim) {
        setMessage({ type: 'success', text: t('claimsUpload.submitSuccess') })
        setDescription('')
        setAssessment(null)
        refetch()
      } else {
        setMessage({ type: 'error', text: t('claimsUpload.submitFailed') })
      }
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : t('claimsUpload.submitFailed') })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DriverScreen title={t('claimsUpload.title')} subtitle={t('claimsUpload.subtitle')}>
      <div className="claims-upload-page">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button type="button" className="btn-refresh" onClick={() => refetch()}>
            {t('common.refresh')}
          </button>
        </div>

        <section className="card claims-upload-section">
          <h3>{t('claimsUpload.uploadPhotos')}</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            {t('claimsUpload.uploadDesc')}
          </p>
          <div className="claims-upload-drop">
            {t('claimsUpload.dropOrDescribe')}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            {t('claimsUpload.descriptionHint')}
          </p>
        </section>

        <section className="card claims-upload-section">
          <h3>{t('claimsUpload.aiAssessment')}</h3>
          <form onSubmit={handleAssess}>
            <label htmlFor="damage-desc" style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.9rem' }}>
              {t('claimsUpload.describeDamage')}
            </label>
            <textarea
              id="damage-desc"
              className="claims-description-input"
              placeholder={t('claimsUpload.descriptionPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="claims-actions">
              <button type="submit" className="btn-refresh" disabled={assessing}>
                {assessing ? t('claimsUpload.assessing') : t('claimsUpload.getAssessment')}
              </button>
              {assessment && (
                <button
                  type="button"
                  className="btn-refresh"
                  onClick={handleSubmitClaim}
                  disabled={submitting}
                >
                  {submitting ? t('claimsUpload.submitting') : t('claimsUpload.submitClaim')}
                </button>
              )}
            </div>
          </form>

          {assessment && (
            <div className="claims-assessment-result">
              <h4>{t('claimsUpload.assessmentResult')}</h4>
              <p style={{ margin: 0 }}>{assessment.damageType}</p>
              <div className="cost">${assessment.estimatedCost.toLocaleString()} {t('claimsUpload.estimatedRepair')}</div>
              {assessment.affectedParts?.length > 0 && (
                <div className="parts">
                  {t('claimsUpload.affectedParts')}: {assessment.affectedParts.join(', ')}
                </div>
              )}
              <span className={`severity severity--${assessment.severity}`}>
                {t(`claimsUpload.severity.${assessment.severity}`)}
              </span>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', marginBottom: 0 }}>{assessment.message}</p>
            </div>
          )}

          {message && (
            <p
              style={{
                marginTop: '1rem',
                color: message.type === 'success' ? 'var(--success, green)' : 'var(--danger)',
                fontSize: '0.9rem',
              }}
            >
              {message.text}
            </p>
          )}
        </section>

        <section className="card claims-upload-section">
          <h3>{t('claimsUpload.recentClaims')}</h3>
          {loading ? (
            <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
          ) : error ? (
            <p style={{ color: 'var(--text-secondary)' }}>{t('claimsUpload.loadClaimsFailed')}</p>
          ) : claims.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('claimsUpload.noClaims')}</p>
          ) : (
            <ul className="claims-list">
              {claims.map((c) => (
                <li key={c.id}>
                  <span className="claim-id">{c.id}</span>
                  <span className={`claim-status claim-status--${c.status}`}>{c.status}</span>
                  <p style={{ margin: '0.25rem 0 0' }}>{c.description}</p>
                  <div className="claim-meta">
                    {formatDate(c.date)}
                    {c.amount > 0 && ` · $${c.amount.toLocaleString()}`}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </DriverScreen>
  )
}
