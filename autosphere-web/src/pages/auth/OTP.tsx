import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './Auth.css'

const OTP_LENGTH = 6

export default function OTP() {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const navigate = useNavigate()

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const next = [...otp]
    next[index] = value.slice(-1)
    setOtp(next)
    if (value && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.every((d) => d)) navigate('/auth/biometric')
  }

  const filled = otp.every((d) => !!d)

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-logo-icon">◇</span>
          <h1>Verify your email</h1>
          <p>Enter the 6-digit code sent to your email</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form auth-form-otp">
          <div className="otp-inputs">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="otp-digit"
                aria-label={`Digit ${i + 1}`}
              />
            ))}
          </div>
          <button type="submit" className="auth-btn-submit" disabled={!filled}>
            Verify
          </button>
        </form>
        <p className="auth-footer">
          Didn’t receive the code? <button type="button" className="auth-link-btn">Resend</button>
        </p>
      </div>
    </div>
  )
}
