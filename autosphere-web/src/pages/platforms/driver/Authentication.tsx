import { Link } from 'react-router-dom'
import DriverScreen from './DriverScreen'

export default function Authentication() {
  return (
    <DriverScreen
      title="Authentication (Splash, Login, Signup, OTP, Biometric Setup)"
      subtitle="Sign in and account security"
    >
      <div className="card-grid">
        <Link to="/auth/splash" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>Splash</h3>
          <p>App intro screen</p>
        </Link>
        <Link to="/auth/login" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>Login</h3>
          <p>Sign in</p>
        </Link>
        <Link to="/auth/signup" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>Signup</h3>
          <p>Create account</p>
        </Link>
        <Link to="/auth/otp" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>OTP</h3>
          <p>Verify email/phone</p>
        </Link>
        <Link to="/auth/biometric" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>Biometric Setup</h3>
          <p>Fingerprint / face</p>
        </Link>
      </div>
    </DriverScreen>
  )
}
