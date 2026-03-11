import GovernmentScreen from './GovernmentScreen'

export default function RegulatorLogin() {
  return (
    <GovernmentScreen
      title="Regulator Login"
      subtitle="Secure access for government and regulatory users"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Credentials</h3>
          <p>Agency ID, SSO, or role-based login.</p>
        </div>
        <div className="card">
          <h3>Permissions</h3>
          <p>View-only vs full access; jurisdiction scope.</p>
        </div>
      </div>
    </GovernmentScreen>
  )
}
