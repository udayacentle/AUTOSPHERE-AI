import { useRef, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import './DriverLayout.css'

export default function InsuranceLayout() {
  const mainRef = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()

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

  return (
    <div className="driver-main platform-content" ref={mainRef}>
      <Outlet />
    </div>
  )
}
