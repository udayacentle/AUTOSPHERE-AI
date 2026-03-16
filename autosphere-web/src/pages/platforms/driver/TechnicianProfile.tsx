import DriverScreen from './DriverScreen'
import { api, type DriverTechnicianProfileData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import './TechnicianProfile.css'

export default function TechnicianProfile() {
  const { t } = useI18n()
  const { data: technician, loading, error } = useApiData<DriverTechnicianProfileData>(() =>
    api.getDriverTechnicianProfile()
  )

  if (loading) {
    return (
      <DriverScreen title={t('technicianProfile.title')} subtitle={t('technicianProfile.subtitle')}>
        <p className="technician-profile-loading">Loading…</p>
      </DriverScreen>
    )
  }

  if (error || !technician) {
    return (
      <DriverScreen title={t('technicianProfile.title')} subtitle={t('technicianProfile.subtitle')}>
        <div className="technician-profile-error">{t('technicianProfile.loadFailed')}</div>
      </DriverScreen>
    )
  }

  return (
    <DriverScreen title={t('technicianProfile.title')} subtitle={t('technicianProfile.subtitle')}>
      <div className="technician-profile-page">
        <div className="technician-profile-hero">
          <div className="technician-profile-avatar">
            {technician.avatar ? (
              <img src={technician.avatar} alt="" />
            ) : (
              <span className="technician-profile-avatar-placeholder" aria-hidden>👤</span>
            )}
          </div>
          <h2 className="technician-profile-name">{technician.name}</h2>
          <div className="technician-profile-rating">
            <span className="technician-profile-stars">★ {technician.rating.toFixed(1)}</span>
            <span className="technician-profile-reviews">
              {technician.reviewCount} {t('technicianProfile.reviews')}
            </span>
          </div>
        </div>

        <section className="technician-profile-section">
          <h3>{t('technicianProfile.currentJob')}</h3>
          <p className="technician-profile-job-type">
            {t('technicianProfile.jobType')}: <strong>{technician.currentJobType}</strong>
          </p>
        </section>

        {technician.skills && technician.skills.length > 0 && (
          <section className="technician-profile-section">
            <h3>{t('technicianProfile.skills')}</h3>
            <ul className="technician-profile-tags">
              {technician.skills.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>
        )}

        {technician.certifications && technician.certifications.length > 0 && (
          <section className="technician-profile-section">
            <h3>{t('technicianProfile.certifications')}</h3>
            <ul className="technician-profile-tags certifications">
              {technician.certifications.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="technician-profile-section">
          <h3>{t('technicianProfile.contact')}</h3>
          <div className="technician-profile-contact">
            {technician.phone && (
              <a href={`tel:${technician.phone}`} className="technician-profile-btn technician-profile-call">
                📞 {t('technicianProfile.call')}
              </a>
            )}
            {technician.email && (
              <a href={`mailto:${technician.email}`} className="technician-profile-btn technician-profile-chat">
                ✉ {t('technicianProfile.chat')}
              </a>
            )}
          </div>
        </section>
      </div>
    </DriverScreen>
  )
}
