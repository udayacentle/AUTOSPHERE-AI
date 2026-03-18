import TechnicianScreen from './TechnicianScreen'
import './TechnicianSections.css'
import { api, type TechnicianProfileData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'

export default function TechnicianLogin() {
  const { t } = useI18n()
  const { data: profile, loading, error, refetch } = useApiData<TechnicianProfileData | null>(() =>
    api.getTechnicianProfile()
  )

  if (loading) {
    return (
      <TechnicianScreen title="Technician Login" subtitle="Secure access for workshop technicians">
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </TechnicianScreen>
    )
  }

  return (
    <TechnicianScreen title="Technician Login" subtitle="Secure access for workshop technicians">
      <div className="card-grid tech-login-grid">
        <div className="card tech-login-card">
          <h3>Credentials</h3>
          <p>Technician ID, email, or SSO login.</p>
          {profile && (
            <div className="tech-login-profile">
              <p><strong>{profile?.name ?? '—'}</strong></p>
              <p className="tech-login-email">{profile?.email ?? '—'}</p>
              <p className="tech-login-role">{profile?.role ?? '—'}</p>
            </div>
          )}
        </div>
        <div className="card tech-login-card">
          <h3>Workshop / bay</h3>
          <p>Assign to workshop location and bay.</p>
          {profile && (
            <div className="tech-login-workshop">
              <p><strong>{profile?.workshop ?? '—'}</strong></p>
              <p>Bay: <strong>{profile?.bay ?? '—'}</strong></p>
            </div>
          )}
        </div>
      </div>
      {error && <p style={{ color: 'var(--danger)', marginTop: '1rem' }}>{error}</p>}
      <div style={{ marginTop: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
    </TechnicianScreen>
  )
}
