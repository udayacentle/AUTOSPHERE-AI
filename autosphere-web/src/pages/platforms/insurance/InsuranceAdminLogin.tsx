import InsuranceScreen from './InsuranceScreen'

export default function InsuranceAdminLogin() {
  return (
    <InsuranceScreen
      title="Insurance Admin Login"
      subtitle="Secure access for insurance administrators"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Admin credentials</h3>
          <p>Email / username and password or SSO.</p>
        </div>
        <div className="card">
          <h3>Role-based access</h3>
          <p>Underwriter, claims manager, compliance roles.</p>
        </div>
      </div>
    </InsuranceScreen>
  )
}
