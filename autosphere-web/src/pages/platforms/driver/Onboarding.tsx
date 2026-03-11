import { useState, useEffect } from 'react'
import DriverScreen from './DriverScreen'
import { api, type DriverProfile } from '../../../api/client'
import { useI18n } from '../../../i18n/context'
import type { Locale } from '../../../i18n/translations'
import './Onboarding.css'

const DISTANCE_OPTIONS = [
  { value: 'km', labelKey: 'profile.distanceKm' },
  { value: 'mi', labelKey: 'profile.distanceMi' },
]

const LANGUAGE_OPTIONS: { value: Locale; labelKey: string }[] = [
  { value: 'en', labelKey: 'profile.langEn' },
  { value: 'es', labelKey: 'profile.langEs' },
  { value: 'fr', labelKey: 'profile.langFr' },
  { value: 'de', labelKey: 'profile.langDe' },
  { value: 'hi', labelKey: 'profile.langHi' },
]

const COUNTRY_CODES = [
  { value: '+91', label: 'India +91' },
  { value: '+1', label: 'USA +1' },
  { value: '+44', label: 'UK +44' },
  { value: '+81', label: 'Japan +81' },
  { value: '+49', label: 'Germany +49' },
]

const defaultProfile: DriverProfile = {
  username: 'demoname',
  fullName: 'John',
  email: 'driver@autosphere.com',
  phoneCode: '+91',
  phone: '123456789',
  licenseNumber: '6789',
  distanceUnits: 'km',
  language: 'en',
  emailNotifications: true,
  pushNotifications: false,
}

export default function Onboarding() {
  const { t, setLocale } = useI18n()
  const [username, setUsername] = useState(defaultProfile.username)
  const [fullName, setFullName] = useState(defaultProfile.fullName)
  const [email, setEmail] = useState(defaultProfile.email)
  const [phoneCode, setPhoneCode] = useState(defaultProfile.phoneCode)
  const [phone, setPhone] = useState(defaultProfile.phone)
  const [licenseNumber, setLicenseNumber] = useState(defaultProfile.licenseNumber)
  const [distanceUnits, setDistanceUnits] = useState(defaultProfile.distanceUnits)
  const [language, setLanguage] = useState<Locale>(defaultProfile.language as Locale)
  const [emailNotifications, setEmailNotifications] = useState(defaultProfile.emailNotifications)
  const [pushNotifications, setPushNotifications] = useState(defaultProfile.pushNotifications)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  useEffect(() => {
    api
      .getProfile()
      .then((profile) => {
        setUsername(profile.username ?? defaultProfile.username)
        setFullName(profile.fullName ?? defaultProfile.fullName)
        setEmail(profile.email ?? defaultProfile.email)
        setPhoneCode(profile.phoneCode ?? defaultProfile.phoneCode)
        setPhone(profile.phone ?? defaultProfile.phone)
        setLicenseNumber(profile.licenseNumber ?? defaultProfile.licenseNumber)
        setDistanceUnits(profile.distanceUnits ?? defaultProfile.distanceUnits)
        const lang = (profile.language ?? defaultProfile.language) as Locale
        setLanguage(lang)
        setLocale(lang)
        setEmailNotifications(profile.emailNotifications ?? defaultProfile.emailNotifications)
        setPushNotifications(profile.pushNotifications ?? defaultProfile.pushNotifications)
      })
      .catch(() => {
        // keep defaults on error
      })
      .finally(() => setLoading(false))
  }, [setLocale])

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (!username.trim()) next.username = 'Username is required'
    if (!fullName.trim()) next.fullName = 'Full name is required'
    if (!email.trim()) next.email = 'Email is required'
    if (!phone.trim()) next.phone = 'Phone is required'
    if (!licenseNumber.trim()) next.licenseNumber = 'License number is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || saving) return
    setSaving(true)
    setErrors({})
    try {
      await api.saveProfile({
        username: username.trim(),
        fullName: fullName.trim(),
        email: email.trim(),
        phoneCode,
        phone: phone.trim(),
        licenseNumber: licenseNumber.trim(),
        distanceUnits,
        language,
        emailNotifications,
        pushNotifications,
      })
      setLocale(language)
      setShowSuccessModal(true)
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to save profile' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DriverScreen title={t('profile.title')} subtitle={t('profile.subtitle')}>
        <p style={{ color: 'var(--text-secondary)' }}>{t('profile.loadingProfile')}</p>
      </DriverScreen>
    )
  }

  return (
    <DriverScreen title={t('profile.title')} subtitle={t('profile.subtitle')}>
      <form className="profile-form" onSubmit={handleSubmit}>
        {errors.submit && (
          <p className="auth-error-msg" style={{ marginBottom: '1rem' }}>{errors.submit}</p>
        )}
        <div className="field-group">
          <label htmlFor="username">
            {t('profile.username')} <span className="required">{t('profile.required')}</span>
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t('profile.username')}
            aria-required
          />
          {errors.username && <p className="auth-error-msg" style={{ marginTop: '-0.5rem', marginBottom: '0.5rem' }}>{errors.username}</p>}
        </div>

        <div className="field-group">
          <label htmlFor="fullname">
            {t('profile.fullName')} <span className="required">{t('profile.required')}</span>
          </label>
          <input
            id="fullname"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={t('profile.fullName')}
            aria-required
          />
          {errors.fullName && <p className="auth-error-msg" style={{ marginTop: '-0.5rem', marginBottom: '0.5rem' }}>{errors.fullName}</p>}
        </div>

        <div className="field-row">
          <div className="field-group">
            <label htmlFor="email">
              {t('profile.email')} <span className="required">{t('profile.required')}</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('profile.email')}
              aria-required
            />
            {errors.email && <p className="auth-error-msg" style={{ marginTop: '-0.5rem', marginBottom: '0.5rem' }}>{errors.email}</p>}
          </div>
          <div className="field-group">
            <label>
              {t('profile.phone')} <span className="required">{t('profile.required')}</span>
            </label>
            <div className="phone-inputs">
              <select
                aria-label="Country code"
                value={phoneCode}
                onChange={(e) => setPhoneCode(e.target.value)}
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                aria-required
              />
            </div>
            {errors.phone && <p className="auth-error-msg" style={{ marginTop: '0.25rem', marginBottom: '0.5rem' }}>{errors.phone}</p>}
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="license">
            {t('profile.licenseNumber')} <span className="required">{t('profile.required')}</span>
          </label>
          <input
            id="license"
            type="text"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            placeholder={t('profile.licenseNumber')}
            aria-required
          />
          {errors.licenseNumber && <p className="auth-error-msg" style={{ marginTop: '-0.5rem', marginBottom: '0.5rem' }}>{errors.licenseNumber}</p>}
        </div>

        <div className="profile-section">
          <h2 className="profile-section-title">{t('profile.driverPrefs')}</h2>
          <div className="field-row">
            <div className="field-group">
              <label htmlFor="distance">{t('profile.distanceUnits')}</label>
              <select
                id="distance"
                value={distanceUnits}
                onChange={(e) => setDistanceUnits(e.target.value)}
              >
                {DISTANCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label htmlFor="language">{t('profile.language')}</label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as Locale)}
              >
                {LANGUAGE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2 className="profile-section-title">{t('profile.notifications')}</h2>
          <div className="checkbox-row">
            <input
              id="email-notif"
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
            />
            <label htmlFor="email-notif">{t('profile.emailNotif')}</label>
          </div>
          <div className="checkbox-row">
            <input
              id="push-notif"
              type="checkbox"
              checked={pushNotifications}
              onChange={(e) => setPushNotifications(e.target.checked)}
            />
            <label htmlFor="push-notif">{t('profile.pushNotif')}</label>
          </div>
        </div>

        <button type="submit" className="btn-save" disabled={saving}>
          {saving ? t('profile.saving') : t('profile.saveProfile')}
        </button>
      </form>

      {showSuccessModal && (
        <div className="profile-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="profile-success-title">
          <div className="profile-modal">
            <h3 id="profile-success-title">{t('profile.success')}</h3>
            <p>{t('profile.profileSaved')}</p>
            <button type="button" className="btn-ok" onClick={() => setShowSuccessModal(false)}>
              {t('profile.ok')}
            </button>
          </div>
        </div>
      )}
    </DriverScreen>
  )
}
