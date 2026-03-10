import { useRef, useEffect } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { DEALER_SCREENS } from '../config/dealerScreens'
import './DriverLayout.css'

export default function DealerLayout() {
  const mainRef = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()

  useEffect(() => {
    const scrollToTop = () => {
      mainRef.current?.scrollTo(0, 0)
      const parentScroll = mainRef.current?.closest('.main-content') as HTMLElement | null
      parentScroll?.scrollTo(0, 0)
    }
    const id = requestAnimationFrame(() => {
      scrollToTop()
      requestAnimationFrame(scrollToTop)
    })
    return () => cancelAnimationFrame(id)
  }, [pathname])

  return (
    <div className="driver-layout">
      <aside className="driver-sidebar">
        <div className="driver-sidebar-header">
          <h2>Dealer Screens</h2>
          <p>14 sections</p>
        </div>
        <nav className="driver-nav">
          {DEALER_SCREENS.map(({ id, path, title }) => (
            <NavLink
              key={path}
              to={`/app/dealer/${path}`}
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
