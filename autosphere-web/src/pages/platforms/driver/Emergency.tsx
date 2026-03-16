import { useState } from 'react'
import DriverScreen from './DriverScreen'
import {
  api,
  type DriverEmergencyData,
  type EmergencyContactItem,
  type EmergencyAlertItem,
} from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import './Emergency.css'

const FALLBACK_EMERGENCY: DriverEmergencyData = {
  emergencyContacts: [
    { id: 'ec-1', name: 'Jane Doe', phone: '+1 555-0101', type: 'family', isPrimary: true },
    { id: 'ec-2', name: 'Police', phone: '911', type: 'emergency', isPrimary: false },
    { id: 'ec-3', name: 'AutoSphere Insurance', phone: '+1 555-0199', type: 'insurer', isPrimary: false },
  ],
  crashDetectionEnabled: true,
  lastKnownLocation: { lat: 37.77, lng: -122.41, updatedAt: new Date().toISOString() },
  recentAlerts: [],
}

const INCIDENT_TYPES = ['accident', 'breakdown', 'other'] as const
const SEVERITY_OPTIONS = ['low', 'medium', 'high', 'critical', 'unknown'] as const

export default function Emergency() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<DriverEmergencyData | null>(() =>
    api.getDriverEmergency()
  )
  const emergencyData = data ?? (error ? FALLBACK_EMERGENCY : null)

  const [sosSending, setSosSending] = useState(false)
  const [sosSent, setSosSent] = useState(false)
  const [incidentType, setIncidentType] = useState<string>('accident')
  const [severity, setSeverity] = useState<string>('unknown')
  const [incidentDescription, setIncidentDescription] = useState('')
  const [reportSubmitting, setReportSubmitting] = useState(false)
  const [reportSubmitted, setReportSubmitted] = useState(false)
  const [reportError, setReportError] = useState('')
  const [togglingCrash, setTogglingCrash] = useState(false)

  const contacts = emergencyData?.emergencyContacts ?? []
  const recentAlerts = emergencyData?.recentAlerts ?? []
  const crashDetectionEnabled = emergencyData?.crashDetectionEnabled ?? true

  const handleSOS = async () => {
    setSosSending(true)
    setSosSent(false)
    setReportError('')
    try {
      const result = await api.triggerSOS()
      if (result?.success) {
        setSosSent(true)
        refetch()
      } else {
        setReportError((result as { error?: string })?.error || 'Failed to send SOS')
      }
    } catch {
      setReportError('Failed to send SOS')
    } finally {
      setSosSending(false)
    }
  }

  const handleReportIncident = async (e: React.FormEvent) => {
    e.preventDefault()
    setReportError('')
    setReportSubmitting(true)
    setReportSubmitted(false)
    try {
      const result = await api.reportIncident({
        type: incidentType,
        severity,
        description: incidentDescription || undefined,
      })
      if (result?.success) {
        setReportSubmitted(true)
        setIncidentDescription('')
        refetch()
      } else {
        setReportError((result as { error?: string })?.error || 'Report failed')
      }
    } catch (err) {
      setReportError(err instanceof Error ? err.message : 'Report failed')
    } finally {
      setReportSubmitting(false)
    }
  }

  const handleToggleCrashDetection = async () => {
    setTogglingCrash(true)
    try {
      await api.updateEmergencySettings(!crashDetectionEnabled)
      refetch()
    } catch {
      setReportError('Failed to update settings')
    } finally {
      setTogglingCrash(false)
    }
  }

  const formatAlertTime = (alert: EmergencyAlertItem) => {
    const iso = alert.dispatchedAt ?? alert.reportedAt ?? ''
    if (!iso) return ''
    try {
      return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
    } catch {
      return iso
    }
  }

  const contactTypeLabel = (type: string) => {
    if (type === 'family') return t('emergency.family')
    if (type === 'emergency') return t('emergency.police')
    if (type === 'insurer') return t('emergency.insurer')
    return type
  }

  if (loading) {
    return (
      <DriverScreen
        title="Emergency & Accident Detection"
        subtitle="SOS, crash detection, emergency contacts"
      >
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </DriverScreen>
    )
  }

  return (
    <DriverScreen
      title="Emergency & Accident Detection"
      subtitle="SOS, crash detection, emergency contacts"
    >
      <div className="emergency-page">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button type="button" className="btn-refresh" onClick={() => refetch()}>
            {t('common.refresh')}
          </button>
        </div>
        {error && (
          <p
            style={{
              marginBottom: '1rem',
              padding: '0.75rem',
              background: 'var(--bg-elevated)',
              borderRadius: 8,
            }}
          >
            {t('fleet.showingSampleData')}
          </p>
        )}

        {emergencyData && (
          <>
            <section className="card emergency-card emergency-sos-section">
              <h3>{t('emergency.quickAlert')}</h3>
              {sosSent ? (
                <div className="emergency-sos-success">
                  <p style={{ fontWeight: 600, margin: '0 0 0.25rem 0' }}>{t('emergency.sosSent')}</p>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {t('emergency.sosDispatched')}
                  </p>
                </div>
              ) : (
                <>
                  <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Tap to send your location to emergency services and saved contacts.
                  </p>
                  <button
                    type="button"
                    className="emergency-sos-btn"
                    onClick={handleSOS}
                    disabled={sosSending}
                  >
                    {sosSending ? t('emergency.sosSending') : t('emergency.sosButton')}
                  </button>
                </>
              )}
            </section>

            <section className="card emergency-card" style={{ marginBottom: '1.5rem' }}>
              <h3>{t('emergency.accidentDetection')}</h3>
              <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {t('emergency.autoDetectNotify')}
              </p>
              <p style={{ margin: '0.5rem 0', fontWeight: 600 }}>
                {crashDetectionEnabled ? t('emergency.crashDetectionOn') : t('emergency.crashDetectionOff')}
              </p>
              <button
                type="button"
                className="btn-refresh"
                style={{ marginTop: '0.5rem' }}
                onClick={handleToggleCrashDetection}
                disabled={togglingCrash}
              >
                {t('emergency.toggleCrashDetection')}
              </button>
            </section>

            <section className="card emergency-card" style={{ marginBottom: '1.5rem' }}>
              <h3>{t('emergency.emergencyContacts')}</h3>
              <ul className="emergency-contacts-list">
                {contacts.map((c: EmergencyContactItem) => (
                  <li key={c.id} className="emergency-contact-item">
                    <span className="emergency-contact-name">{c.name}</span>
                    <span className="emergency-contact-type">{contactTypeLabel(c.type)}</span>
                    {c.isPrimary && <span className="emergency-contact-badge">{t('emergency.primary')}</span>}
                    <a href={`tel:${c.phone.replace(/\s/g, '')}`} className="emergency-call-link">
                      {t('emergency.call')} {c.phone}
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            <section className="card emergency-card" style={{ marginBottom: '1.5rem' }}>
              <h3>{t('emergency.reportIncident')}</h3>
              {reportSubmitted ? (
                <p style={{ color: 'var(--success, green)', margin: 0 }}>{t('emergency.submitted')}</p>
              ) : (
                <form onSubmit={handleReportIncident} className="emergency-report-form">
                  <label>
                    <span className="emergency-label">{t('emergency.incidentType')}</span>
                    <select
                      value={incidentType}
                      onChange={(e) => setIncidentType(e.target.value)}
                      className="emergency-select"
                    >
                      {INCIDENT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {t(`emergency.${type}`)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="emergency-label">{t('emergency.severity')}</span>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                      className="emergency-select"
                    >
                      {SEVERITY_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="emergency-label">{t('emergency.description')}</span>
                    <textarea
                      value={incidentDescription}
                      onChange={(e) => setIncidentDescription(e.target.value)}
                      className="emergency-textarea"
                      rows={2}
                      placeholder="Optional details..."
                    />
                  </label>
                  {reportError && (
                    <p style={{ color: 'var(--danger)', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
                      {reportError}
                    </p>
                  )}
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={reportSubmitting}
                  >
                    {reportSubmitting ? '…' : t('emergency.submitReport')}
                  </button>
                </form>
              )}
            </section>

            <section className="card emergency-card">
              <h3>{t('emergency.recentAlerts')}</h3>
              {recentAlerts.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{t('emergency.noAlerts')}</p>
              ) : (
                <ul className="emergency-alerts-list">
                  {recentAlerts.map((alert) => (
                    <li key={alert.id} className="emergency-alert-item">
                      <span className="emergency-alert-type">{alert.type === 'sos' ? 'SOS' : alert.type}</span>
                      <span className="emergency-alert-time">{formatAlertTime(alert)}</span>
                      <span className="emergency-alert-status">{alert.status}</span>
                      {alert.message && (
                        <span className="emergency-alert-message">{alert.message}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        {!emergencyData && !loading && (
          <p style={{ color: 'var(--danger)' }}>{error ?? 'Unable to load emergency data'}</p>
        )}
      </div>
    </DriverScreen>
  )
}
