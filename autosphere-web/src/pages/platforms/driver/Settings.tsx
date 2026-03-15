import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DriverScreen from './DriverScreen'
import { useI18n } from '../../../i18n/context'
import './Settings.css'

const THEME_STORAGE_KEY = 'autosphere-theme'
const LOCATION_SHARING_KEY = 'autosphere-settings-location-sharing'
const SHARE_ANALYTICS_KEY = 'autosphere-settings-share-analytics'

export default function Settings() {
  const { t } = useI18n()
  const navigate = useNavigate()

  const theme = (() => {
    try {
      return (localStorage.getItem(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark') as 'dark' | 'light'
    } catch {
      return 'dark'
    }
  })()

  const [locationSharing, setLocationSharing] = useState(() => {
    try {
      return localStorage.getItem(LOCATION_SHARING_KEY) !== 'false'
    } catch {
      return true
    }
  })

  const [shareAnalytics, setShareAnalytics] = useState(() => {
    try {
      return localStorage.getItem(SHARE_ANALYTICS_KEY) === 'true'
    } catch {
      return false
    }
  })

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
    document.documentElement.setAttribute('data-theme', next)
    window.dispatchEvent(new CustomEvent('autosphere-theme-change', { detail: next }))
  }

  const toggleLocationSharing = () => {
    const next = !locationSharing
    setLocationSharing(next)
    try {
      localStorage.setItem(LOCATION_SHARING_KEY, String(next))
    } catch {
      /* ignore */
    }
  }

  const toggleShareAnalytics = () => {
    const next = !shareAnalytics
    setShareAnalytics(next)
    try {
      localStorage.setItem(SHARE_ANALYTICS_KEY, String(next))
    } catch {
      /* ignore */
    }
  }

  const handleExportData = () => {
    // Placeholder: in production would trigger export flow
    alert(t('settings.exportComingSoon'))
  }

  const handleDeleteAccount = () => {
    if (window.confirm(t('settings.deleteConfirm'))) {
      // Placeholder: would call API and redirect
      navigate('/auth/login')
    }
  }

  const handleLogOut = () => {
    try {
      localStorage.removeItem('autosphere-token')
    } catch {
      /* ignore */
    }
    navigate('/auth/login')
  }

  return (
    <DriverScreen
      title={t('settings.title')}
      subtitle={t('settings.subtitle')}
    >
      <div className="settings-sections">
        <section className="settings-block card">
          <h2 className="settings-block-title">{t('settings.account')}</h2>
          <ul className="settings-list">
            <li>
              <Link to="/app/driver/onboarding" className="settings-link">
                {t('settings.profileAndAccount')}
              </Link>
            </li>
            <li className="settings-item-static">
              <span>{t('settings.linkedVehicles')}</span>
              <span className="settings-hint">— {t('settings.linkedVehiclesHint')}</span>
            </li>
          </ul>
        </section>

        <section className="settings-block card">
          <h2 className="settings-block-title">{t('profile.notifications')}</h2>
          <ul className="settings-list">
            <li className="settings-row">
              <span>{t('profile.emailNotif')}</span>
              <Link to="/app/driver/onboarding" className="settings-link settings-link-inline">
                {t('settings.manageInProfile')}
              </Link>
            </li>
            <li className="settings-row">
              <span>{t('profile.pushNotif')}</span>
              <Link to="/app/driver/onboarding" className="settings-link settings-link-inline">
                {t('settings.manageInProfile')}
              </Link>
            </li>
            <li>
              <Link to="/app/driver/authentication" className="settings-link">
                {t('settings.biometric')}
              </Link>
            </li>
          </ul>
        </section>

        <section className="settings-block card">
          <h2 className="settings-block-title">{t('settings.privacyAndData')}</h2>
          <ul className="settings-list">
            <li className="settings-toggle-row">
              <div className="settings-toggle-label">
                <span className="settings-toggle-name">{t('settings.locationSharing')}</span>
                <span className="settings-hint">{t('settings.locationHint')}</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={locationSharing}
                className={`settings-switch ${locationSharing ? 'settings-switch-on' : ''}`}
                onClick={toggleLocationSharing}
                aria-label={t('settings.locationSharing')}
              >
                <span className="settings-switch-knob" />
              </button>
            </li>
            <li className="settings-toggle-row">
              <div className="settings-toggle-label">
                <span className="settings-toggle-name">{t('settings.shareAnalytics')}</span>
                <span className="settings-hint">{t('settings.analyticsHint')}</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={shareAnalytics}
                className={`settings-switch ${shareAnalytics ? 'settings-switch-on' : ''}`}
                onClick={toggleShareAnalytics}
                aria-label={t('settings.shareAnalytics')}
              >
                <span className="settings-switch-knob" />
              </button>
            </li>
            <li>
              <button type="button" className="settings-link settings-btn" onClick={handleExportData}>
                {t('settings.exportData')}
              </button>
            </li>
            <li className="settings-danger-row">
              <button
                type="button"
                className="settings-link settings-btn settings-delete"
                onClick={handleDeleteAccount}
              >
                {t('settings.deleteAccount')}
              </button>
              <span className="settings-hint settings-delete-hint">{t('settings.deleteAccountHint')}</span>
            </li>
          </ul>
        </section>

        <section className="settings-block card">
          <h2 className="settings-block-title">{t('settings.appPreferences')}</h2>
          <ul className="settings-list">
            <li>
              <button type="button" className="settings-link settings-btn" onClick={toggleTheme}>
                {t('settings.theme')}: {theme === 'dark' ? t('settings.darkMode') : t('settings.lightMode')}
              </button>
            </li>
            <li>
              <Link to="/app/driver/onboarding" className="settings-link">
                {t('settings.language')} — {t('settings.profileAndAccount')}
              </Link>
            </li>
          </ul>
        </section>

        <section className="settings-block card">
          <h2 className="settings-block-title">{t('settings.support')}</h2>
          <ul className="settings-list">
            <li className="settings-item-static">
              <span>{t('settings.helpSupport')}</span>
            </li>
            <li>
              <button type="button" className="settings-link settings-btn settings-logout" onClick={handleLogOut}>
                {t('settings.logOut')}
              </button>
            </li>
          </ul>
        </section>
      </div>
    </DriverScreen>
  )
}
