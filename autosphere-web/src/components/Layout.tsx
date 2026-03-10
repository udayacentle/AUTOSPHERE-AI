import { useState, useRef, useEffect } from 'react'
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { PLATFORMS } from '../config/platforms'
import { DRIVER_SCREENS } from '../config/driverScreens'
import { INSURANCE_SCREENS } from '../config/insuranceScreens'
import { DEALER_SCREENS } from '../config/dealerScreens'
import './Layout.css'

const HOVER_LEAVE_DELAY_MS = 120
const THEME_STORAGE_KEY = 'autosphere-theme'

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [hoveredPath, setHoveredPath] = useState<string | null>(null)

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
  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  const handleMouseEnter = (path: string) => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current)
      leaveTimeoutRef.current = null
    }
    setHoveredPath(path)
  }

  const handleMouseLeave = () => {
    leaveTimeoutRef.current = setTimeout(() => setHoveredPath(null), HOVER_LEAVE_DELAY_MS)
  }

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
          {PLATFORMS.map(({ path, label, icon }) => (
            <div
              key={path}
              className="nav-item-wrapper"
              onMouseEnter={() => handleMouseEnter(path)}
              onMouseLeave={handleMouseLeave}
            >
              <NavLink
                to={`/app/${path}`}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{icon}</span>
                <span>{label}</span>
              </NavLink>
              {hoveredPath === path && (
                <div className="nav-dropdown">
                  <div className="nav-dropdown-title">{label} — Screens</div>
                  <ul className="nav-dropdown-list">
                    {path === 'driver'
                      ? DRIVER_SCREENS.map(({ id, path: screenPath, title }) => (
                          <li key={screenPath}>
                            <Link to={`/app/driver/${screenPath}`} className="nav-dropdown-link">
                              <span className="nav-dropdown-num">{id}</span>
                              <span className="nav-dropdown-label">{title}</span>
                            </Link>
                          </li>
                        ))
                      : path === 'insurance'
                      ? INSURANCE_SCREENS.map(({ id, path: screenPath, title }) => (
                          <li key={screenPath}>
                            <Link to={`/app/insurance/${screenPath}`} className="nav-dropdown-link">
                              <span className="nav-dropdown-num">{id}</span>
                              <span className="nav-dropdown-label">{title}</span>
                            </Link>
                          </li>
                        ))
                      : path === 'dealer'
                      ? DEALER_SCREENS.map(({ id, path: screenPath, title }) => (
                          <li key={screenPath}>
                            <Link to={`/app/dealer/${screenPath}`} className="nav-dropdown-link">
                              <span className="nav-dropdown-num">{id}</span>
                              <span className="nav-dropdown-label">{title}</span>
                            </Link>
                          </li>
                        ))
                      : PLATFORMS.find((p) => p.path === path)!.screens.map((screen, i) => (
                          <li key={screen}>
                            <span className="nav-dropdown-num">{i + 1}</span>
                            <span className="nav-dropdown-label">{screen}</span>
                          </li>
                        ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="btn-logout" onClick={() => navigate('/auth/login')}>
            Exit to Home
          </button>
        </div>
      </aside>
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
