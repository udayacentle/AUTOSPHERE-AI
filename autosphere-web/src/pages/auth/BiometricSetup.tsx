import { useNavigate } from 'react-router-dom'
import './Auth.css'

export default function BiometricSetup() {
  const navigate = useNavigate()

  const handleComplete = () => {
    navigate('/app', { replace: true })
  }

  const handleSkip = () => {
    navigate('/app', { replace: true })
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <span className="auth-logo-icon">◇</span>
          <h1>Biometric setup</h1>
          <p>Secure your account with fingerprint or face recognition</p>
        </div>
        <div className="biometric-content">
          <div className="biometric-icon" aria-hidden>🔐</div>
          <p className="biometric-desc">
            You can enable biometric sign-in for faster access. You can change this later in Settings.
          </p>
        </div>
        <div className="auth-actions">
          <button type="button" className="auth-btn-submit" onClick={handleComplete}>
            Enable biometrics
          </button>
          <button type="button" className="auth-btn-skip" onClick={handleSkip}>
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
