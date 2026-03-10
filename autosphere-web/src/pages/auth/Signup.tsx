import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Auth.css'
import './Login.css'

export default function Signup() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('driver')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const nameTrim = fullName.trim()
    const emailTrim = email.trim()
    if (!nameTrim) {
      setError('Enter full name.')
      return
    }
    if (!emailTrim) {
      setError('Enter email.')
      return
    }
    if (!password) {
      setError('Enter password.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    navigate('/auth/otp')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-logo-icon">◇</span>
          <h1>Create account</h1>
          <p>Sign up for AutoSphere AI</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <label>
            <span>Full name <span className="required">*</span></span>
            <input
              type="text"
              placeholder="Enter full name"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setError('') }}
            />
          </label>
          <label>
            <span>Email <span className="required">*</span></span>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
            />
          </label>
          <label>
            <span>Password <span className="required">*</span></span>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              minLength={6}
            />
          </label>
          <label>
            <span>Platform / Role <span className="required">*</span></span>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="driver">Driver</option>
              <option value="insurance">Insurance Admin</option>
              <option value="dealer">Dealer</option>
              <option value="sales">Sales Personnel</option>
              <option value="technician">Technician</option>
              <option value="property">Property Owner</option>
              <option value="government">Government Regulator</option>
              <option value="ai-admin">AI / Super Admin</option>
            </select>
          </label>
          {error && <p className="auth-error-msg">{error}</p>}
          <button type="submit" className="auth-btn-submit login-btn-signin">Sign Up</button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/auth/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
