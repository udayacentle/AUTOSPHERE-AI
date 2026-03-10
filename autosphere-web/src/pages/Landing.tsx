import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Landing.css'
import './auth/Auth.css'
import './auth/Login.css'

const THEME_STORAGE_KEY = 'autosphere-theme'

export default function Landing() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark'
    } catch {
      return 'dark'
    }
  })
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const trimmed = usernameOrEmail.trim()
    if (!trimmed) {
      setError('Enter username or email.')
      return
    }
    if (!password) {
      setError('Enter password.')
      return
    }
    navigate('/app')
  }

  return (
    <div className="landing landing-with-login">
      <header className="landing-header">
        <div className="landing-logo">
          <span className="logo-icon">◇</span>
          <span>AutoSphere AI</span>
        </div>
        <button
          type="button"
          className="login-theme-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </header>

      <section className="landing-main">
        <div className="auth-card login-card">
          <div className="login-header">
            <h1>Login</h1>
            <p>Sign in with your username or email. Fields marked with * are required.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form login-form" noValidate>
            <label className="login-label">
              <span>Username or email <span className="required">*</span></span>
              <input
                type="text"
                placeholder="Enter username or email"
                value={usernameOrEmail}
                onChange={(e) => { setUsernameOrEmail(e.target.value); setError('') }}
              />
            </label>
            <label className="login-label">
              <span>Password <span className="required">*</span></span>
              <div className="login-password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  <span className="icon-password-toggle">
                    {showPassword ? 'Hide' : 'Show'}
                  </span>
                </button>
              </div>
            </label>
            {error && <p className="auth-error-msg">{error}</p>}
            <button type="submit" className="auth-btn-submit login-btn-signin">
              Sign in
            </button>

            <div className="login-divider">
              <span>or</span>
            </div>

            <button type="button" className="login-btn-social login-btn-google">
              <span className="google-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.63-6.05z"/>
                  <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-2.7.83 4.8 4.8 0 0 1-4.53-3.32H1.46v2.07A8 8 0 0 0 8.98 17z"/>
                  <path fill="#FBBC05" d="M4.05 10.57a4.8 4.8 0 0 1 0-3.14V5.36H1.46a8 8 0 0 0 0 7.28l2.59-2.07z"/>
                  <path fill="#EA4335" d="M8.98 4.18c1.34 0 2.55.46 3.5 1.36l2.6-2.6A7.8 7.8 0 0 0 8.98 1a8 8 0 0 0-7.52 5.36l2.59 2.07a4.8 4.8 0 0 1 4.93-3.18z"/>
                </svg>
              </span>
              Continue with Google
            </button>
          </form>

          <p className="login-footer-link">
            <Link to="/auth/signup">Create account (Signup)</Link>
          </p>
        </div>
      </section>

      <footer className="landing-footer">
        <p>AutoSphere AI — Complete Screen Inventory · February 2026</p>
      </footer>
    </div>
  )
}
