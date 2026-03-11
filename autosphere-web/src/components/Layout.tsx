import { useState, useEffect } from 'react'
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { PLATFORMS } from '../config/platforms'
import { useI18n } from '../i18n/context'
import { DRIVER_SCREENS } from '../config/driverScreens'
import { INSURANCE_SCREENS } from '../config/insuranceScreens'
import { DEALER_SCREENS } from '../config/dealerScreens'
import { SALES_SCREENS } from '../config/salesScreens'
import { TECHNICIAN_SCREENS } from '../config/technicianScreens'
import { PROPERTY_SCREENS } from '../config/propertyScreens'
import { GOVERNMENT_SCREENS } from '../config/governmentScreens'
import { AI_ADMIN_SCREENS } from '../config/aiAdminScreens'
import { ANALYTICS_SCREENS } from '../config/analyticsScreens'
import { AI_ASSISTANT_SCREENS } from '../config/aiAssistantScreens'
import './Layout.css'

const THEME_STORAGE_KEY = 'autosphere-theme'

function pathToNavKey(path: string): string {
  return path.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
}

function pathToScreenKey(path: string): string {
  return path.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
}

function getPlatformFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/app\/([^/]+)/)
  return match && match[1] !== 'app' ? match[1] : null
}

const PLATFORM_SCREENS: Record<string, Array<{ id: number; path: string; title: string }>> = {
  driver: DRIVER_SCREENS,
  insurance: INSURANCE_SCREENS,
  dealer: DEALER_SCREENS,
  sales: SALES_SCREENS,
  technician: TECHNICIAN_SCREENS,
  property: PROPERTY_SCREENS,
  government: GOVERNMENT_SCREENS,
  'ai-admin': AI_ADMIN_SCREENS,
  analytics: ANALYTICS_SCREENS,
  'ai-assistant': AI_ASSISTANT_SCREENS,
}

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useI18n()
  const currentPlatform = getPlatformFromPath(location.pathname)
  const subsections = currentPlatform ? PLATFORM_SCREENS[currentPlatform] : null

  // On reload: behave like clicking the AutoSphere AI logo — go to welcome page
  useEffect(() => {
    if (location.pathname.startsWith('/app') && location.pathname !== '/app') {
      navigate('/app', { replace: true })
    }
  }, []) // run once on mount (reload = fresh mount)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as 'dark' | 'light' | null
      return stored === 'light' ? 'light' : 'dark'
    } catch {
      return 'dark'
    }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <button className="logo" onClick={() => navigate('/app')}>
            <span className="logo-icon">◇</span>
            <span className="logo-text">AutoSphere AI</span>
          </button>
        </div>
        <nav className="sidebar-nav">
          {PLATFORMS.map(({ path, icon }) => (
            <div key={path} className="nav-item-wrapper">
              <NavLink
                to={`/app/${path}`}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{icon}</span>
                <span>{t(`nav.${pathToNavKey(path)}`)}</span>
              </NavLink>
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="btn-logout" onClick={() => navigate('/auth/login')}>
            {t('nav.exitToHome')}
          </button>
        </div>
      </aside>
      {subsections && currentPlatform && (
        <aside className="sidebar-subsections">
          <div className="sidebar-subsections-header">
            <h2>{t(`nav.${pathToNavKey(currentPlatform)}`)} — {t('nav.screens')}</h2>
            <p>{subsections.length} {t('common.sections')}</p>
          </div>
          <nav className="sidebar-subsections-nav">
            {subsections.map(({ id, path: screenPath, title }) => {
              const href = currentPlatform === 'driver' && screenPath === 'authentication'
                ? '/app/driver/authentication'
                : `/app/${currentPlatform}/${screenPath}`
              const active = location.pathname === href
              const screenKey = `screens.${currentPlatform}.${pathToScreenKey(screenPath)}`
              const translated = t(screenKey)
              const label = translated && !translated.startsWith('screens.') ? translated : title.split(' (')[0].trim()
              return (
                <Link
                  key={screenPath}
                  to={href}
                  className={`sidebar-subsections-link ${active ? 'active' : ''}`}
                >
                  <span className="sidebar-subsections-num">{id}</span>
                  <span className="sidebar-subsections-label">{label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>
      )}
      <main className="main">
        <header className="topbar">
          <div className="topbar-spacer" />
          <div className="topbar-actions">
            <button
              type="button"
              className="btn-theme"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              type="button"
              className="btn-logout-top"
              onClick={() => navigate('/auth/login')}
              title="Logout"
              aria-label="Logout"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
                <line x1="12" y1="2" x2="12" y2="12"/>
              </svg>
            </button>
          </div>
        </header>
        <div className="main-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
