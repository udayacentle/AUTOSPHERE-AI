import { useRef, useEffect } from 'react'
import { Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { FleetVehiclesProvider } from '../contexts/FleetVehiclesContext'
import { FleetRoleProvider, useFleetRole } from '../contexts/FleetRoleContext'
import { isFleetPathAllowed, FLEET_ROLE_HOME } from '../config/fleetRoleAccess'
import FleetRoleBanner from './FleetRoleBanner'
import './DriverLayout.css'

function FleetLayoutInner() {
  const mainRef = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { role } = useFleetRole()

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo(0, 0)
      mainRef.current?.scrollTo(0, 0)
      let el: HTMLElement | null = mainRef.current
      while (el) {
        if (el.scrollTop !== undefined && el.scrollTop > 0) el.scrollTo(0, 0)
        el = el.parentElement
      }
    }
    scrollToTop()
    const id = requestAnimationFrame(() => {
      scrollToTop()
      requestAnimationFrame(scrollToTop)
    })
    const t1 = setTimeout(scrollToTop, 50)
    const t2 = setTimeout(scrollToTop, 200)
    return () => {
      cancelAnimationFrame(id)
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [pathname])

  useEffect(() => {
    if (pathname === '/app/fleet' && role === 'guest') {
      navigate('/app/fleet/guest-fleet', { replace: true })
    }
  }, [pathname, role, navigate])

  const pathSeg = pathname.replace(/^\/app\/fleet\/?/, '').split('/')[0] || ''
  if (pathSeg && !isFleetPathAllowed(role, pathSeg)) {
    return <Navigate to={`/app/fleet/${FLEET_ROLE_HOME[role]}`} replace />
  }

  return (
    <FleetVehiclesProvider>
      <FleetRoleBanner />
      <div className="driver-main platform-content" ref={mainRef}>
        <Outlet />
      </div>
    </FleetVehiclesProvider>
  )
}

export default function FleetLayout() {
  return (
    <FleetRoleProvider>
      <FleetLayoutInner />
    </FleetRoleProvider>
  )
}
