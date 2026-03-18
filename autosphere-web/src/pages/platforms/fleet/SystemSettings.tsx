import { useState, useEffect } from 'react'
import { useI18n } from '../../../i18n/context'
import { api, type FleetSystemSettingsData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import FleetScreen from './FleetScreen'
import { useFleetRole } from '../../../contexts/FleetRoleContext'
import './FleetBrd.css'

export default function SystemSettings() {
  const { t } = useI18n()
  const { systemSettingsFull } = useFleetRole()
  const { data, loading, error, refetch } = useApiData<FleetSystemSettingsData | null>(() => api.getFleetSettings())
  const [form, setForm] = useState<FleetSystemSettingsData | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (data) setForm(data)
  }, [data])

  const save = async () => {
    if (!form) return
    setSaving(true)
    try {
      const payload = systemSettingsFull
        ? form
        : { siteName: form.siteName, maintenanceWindowUtc: form.maintenanceWindowUtc }
      const next = await api.saveFleetSettings(payload)
      setForm((prev) => (prev && next ? { ...prev, ...next } : next))
    } catch {
      /* ignore */
    } finally {
      setSaving(false)
    }
  }

  return (
    <FleetScreen title={t('fleet.brdSettingsTitle')} subtitle={t('fleet.brdSettingsSubtitle')}>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
        {t('fleet.brdSettingsNote')}
      </p>
      {!systemSettingsFull && (
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--accent-warm, #b45309)',
            marginBottom: '1rem',
            padding: '0.5rem 0.75rem',
            background: 'var(--bg-elevated)',
            borderRadius: 8,
          }}
        >
          {t('fleet.entitySettingsLimited')}
        </p>
      )}
      <button type="button" className="btn-refresh" style={{ marginBottom: '1rem' }} onClick={() => refetch()}>
        {t('common.refresh')}
      </button>
      {loading || !form ? (
        <p>{t('common.loading')}</p>
      ) : (
        <section className="card fleet-brd-card" style={{ maxWidth: 520 }}>
          <label className="login-label" style={{ display: 'block', marginBottom: '0.75rem' }}>
            <span>Site name</span>
            <input
              value={form.siteName}
              onChange={(e) => setForm((f) => (f ? { ...f, siteName: e.target.value } : f))}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', borderRadius: 8, border: '1px solid var(--border)' }}
            />
          </label>
          <label className="login-label" style={{ display: 'block', marginBottom: '0.75rem' }}>
            <span>Maintenance window (UTC)</span>
            <input
              value={form.maintenanceWindowUtc}
              onChange={(e) => setForm((f) => (f ? { ...f, maintenanceWindowUtc: e.target.value } : f))}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', borderRadius: 8, border: '1px solid var(--border)' }}
            />
          </label>
          <label className="login-label" style={{ display: 'block', marginBottom: '0.75rem' }}>
            <span>
              Data retention (days){' '}
              {!systemSettingsFull && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  ({t('fleet.settingsFieldSuperOnly')})
                </span>
              )}
            </span>
            <input
              type="number"
              value={form.dataRetentionDays}
              onChange={(e) =>
                setForm((f) => (f ? { ...f, dataRetentionDays: Number(e.target.value) || 0 } : f))
              }
              disabled={!systemSettingsFull}
              style={{
                width: '100%',
                padding: '0.5rem',
                marginTop: '0.25rem',
                borderRadius: 8,
                border: '1px solid var(--border)',
                opacity: systemSettingsFull ? 1 : 0.65,
              }}
            />
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem',
              opacity: systemSettingsFull ? 1 : 0.65,
            }}
          >
            <input
              type="checkbox"
              checked={form.requireMfaForAdmins}
              onChange={(e) => setForm((f) => (f ? { ...f, requireMfaForAdmins: e.target.checked } : f))}
              disabled={!systemSettingsFull}
            />
            <span>
              Require MFA for admins
              {!systemSettingsFull && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 4 }}>
                  ({t('fleet.settingsFieldSuperOnly')})
                </span>
              )}
            </span>
          </label>
          <label className="login-label" style={{ display: 'block', marginBottom: '1rem' }}>
            <span>
              Compliance note{' '}
              {!systemSettingsFull && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  ({t('fleet.settingsFieldSuperOnly')})
                </span>
              )}
            </span>
            <textarea
              value={form.complianceNote}
              onChange={(e) => setForm((f) => (f ? { ...f, complianceNote: e.target.value } : f))}
              rows={3}
              disabled={!systemSettingsFull}
              style={{
                width: '100%',
                padding: '0.5rem',
                marginTop: '0.25rem',
                borderRadius: 8,
                border: '1px solid var(--border)',
                opacity: systemSettingsFull ? 1 : 0.65,
              }}
            />
          </label>
          <button type="button" className="btn-refresh" disabled={saving} onClick={save}>
            {saving ? t('common.loading') : t('fleet.brdSaveSettings')}
          </button>
        </section>
      )}
      {error && <p style={{ marginTop: '0.5rem' }}>{t('fleet.showingSampleData')}</p>}
    </FleetScreen>
  )
}
