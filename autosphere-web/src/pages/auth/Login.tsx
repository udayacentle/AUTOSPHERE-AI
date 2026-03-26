import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useI18n } from '../../i18n/context'
import { loadSavedLoginUsernames, rememberLoginUsername } from './loginUsernameStorage'
import { LoginUsernameField } from './LoginUsernameField'
import './Auth.css'
import './Login.css'

const THEME_STORAGE_KEY = 'autosphere-theme'

export default function Login() {
  const { t } = useI18n()
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [savedUsernames, setSavedUsernames] = useState<string[]>([])
  const [savedAccountPick, setSavedAccountPick] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark'
    } catch {
      return 'dark'
    }
  })
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    setSavedUsernames(loadSavedLoginUsernames())
  }, [])

  useEffect(() => {
    const token = searchParams.get('google_token')
    const email = searchParams.get('google_email')
    const oauthError = searchParams.get('google_error')
    if (oauthError) {
      setError(oauthError)
      return
    }
    if (!token) return
    try {
      localStorage.setItem('autosphere-token', token)
    } catch {
      /* ignore */
    }
    if (email) {
      rememberLoginUsername(email)
      setSavedUsernames(loadSavedLoginUsernames())
    }
    navigate('/app', { replace: true })
  }, [searchParams, navigate])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const trimmed = usernameOrEmail.trim()
    if (!trimmed) {
      setError(t('auth.errorUsernameRequired'))
      return
    }
    if (!password) {
      setError(t('auth.errorPasswordRequired'))
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.message || t('auth.errorLoginFailed'))
        return
      }
      rememberLoginUsername(trimmed)
      setSavedUsernames(loadSavedLoginUsernames())
      if (data.token) {
        try {
          localStorage.setItem('autosphere-token', data.token)
        } catch {
          /* ignore */
        }
      }
      navigate('/app')
    } catch (err) {
      setError(t('auth.errorServer'))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)
    try {
      window.location.assign('/auth/google/start')
    } catch {
      setError(t('auth.errorServer'))
      setLoading(false)
    }
  }

  return (
    <div className="auth-page login-page">
      <button
        type="button"
        className="login-theme-btn"
        onClick={toggleTheme}
        title={t('auth.themeSwitch')}
        aria-label={t('auth.themeSwitch')}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      <div className="login-layout">
        <div className="login-brand">
          <span className="login-brand-logo">◇</span>
          <h2 className="login-brand-title">AutoSphere AI</h2>
          <p className="login-brand-caption">{t('auth.brandCaption')}</p>
        </div>
        <div className="login-form-panel">
      <div className="auth-card login-card">
        <div className="login-header">
          <h1>{t('auth.loginTitle')}</h1>
          <p>{t('auth.loginSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form login-form" noValidate>
          <label className="login-label">
            <span>{t('auth.usernameOrEmail')} <span className="required">{t('profile.required')}</span></span>
            <LoginUsernameField
              id="login-username"
              value={usernameOrEmail}
              onChange={(v) => {
                setUsernameOrEmail(v)
                setError('')
              }}
              suggestions={savedUsernames}
              placeholder={t('auth.enterUsernameOrEmail')}
            />
          </label>
          <label className="login-label">
            <span>{t('auth.password')} <span className="required">{t('profile.required')}</span></span>
            <div className="login-password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.enterPassword')}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                tabIndex={-1}
              >
                <span className="icon-password-toggle">
                  {showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                </span>
              </button>
            </div>
          </label>
          {error && <p className="auth-error-msg">{error}</p>}
          <button type="submit" className="auth-btn-submit login-btn-signin" disabled={loading}>
            {loading ? t('auth.signingIn') : t('auth.signIn')}
          </button>

          <div className="login-divider">
            <span>or</span>
          </div>

          <button
            type="button"
            className="login-btn-social login-btn-google"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <span className="google-icon" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.63-6.05z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-2.7.83 4.8 4.8 0 0 1-4.53-3.32H1.46v2.07A8 8 0 0 0 8.98 17z"/>
                <path fill="#FBBC05" d="M4.05 10.57a4.8 4.8 0 0 1 0-3.14V5.36H1.46a8 8 0 0 0 0 7.28l2.59-2.07z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.34 0 2.55.46 3.5 1.36l2.6-2.6A7.8 7.8 0 0 0 8.98 1a8 8 0 0 0-7.52 5.36l2.59 2.07a4.8 4.8 0 0 1 4.93-3.18z"/>
              </svg>
            </span>
            {loading ? t('auth.signingIn') : t('auth.continueWithGoogle')}
          </button>
        </form>

        <p className="login-footer-link">
          <Link to="/auth/signup">{t('auth.createAccountSignup')}</Link>
        </p>
      </div>
        </div>
      </div>
    </div>
  )
}
