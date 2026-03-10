import { useRef, useEffect } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { DRIVER_SCREENS } from '../config/driverScreens'
import './DriverLayout.css'

export default function DriverLayout() {
  const mainRef = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()

  // Scroll to top when a different driver tab is selected (this panel + parent .main-content)
  useEffect(() => {
    const scrollToTop = () => {
      mainRef.current?.scrollTo(0, 0)
      const parentScroll = mainRef.current?.closest('.main-content') as HTMLElement | null
      parentScroll?.scrollTo(0, 0)
    }
    const id = requestAnimationFrame(() => {
      scrollToTop()
      requestAnimationFrame(scrollToTop) // after paint
    })
    return () => cancelAnimationFrame(id)
  }, [pathname])

  return (
    <div className="driver-layout">
      <aside className="driver-sidebar">
        <div className="driver-sidebar-header">
          <h2>Driver Screens</h2>
          <p>26 sections</p>
        </div>
        <nav className="driver-nav">
          {DRIVER_SCREENS.map(({ id, path, title }) => (
            <NavLink
              key={path}
              to={path === 'authentication' ? '/app/driver/authentication' : `/app/driver/${path}`}
              className={({ isActive }) => `driver-nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="driver-nav-num">{id}</span>
              <span>{title.split(' (')[0].trim()}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="driver-main" ref={mainRef}>
        <Outlet />
      </div>
    </div>
  )
}
