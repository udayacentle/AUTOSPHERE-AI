import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Auth.css'

const SPLASH_DURATION_MS = 2500

export default function Splash() {
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => navigate('/auth/login', { replace: true }), SPLASH_DURATION_MS)
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <div className="auth-page auth-splash" onClick={() => navigate('/auth/login', { replace: true })}>
      <div className="auth-splash-inner">
        <span className="auth-logo-icon">◇</span>
        <h1 className="auth-splash-title">AutoSphere AI</h1>
        <p className="auth-splash-tagline">Mobility & Vehicle Intelligence</p>
        <p className="auth-splash-hint">Tap or wait to continue</p>
      </div>
    </div>
  )
}
