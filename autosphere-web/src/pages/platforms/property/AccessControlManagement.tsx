import PropertyScreen from './PropertyScreen'

export default function AccessControlManagement() {
  return (
    <PropertyScreen
      title="Access Control Management"
      subtitle="Manage who can access parking and chargers"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Access rules</h3>
          <p>By user, role, vehicle, subscription, or pass.</p>
        </div>
        <div className="card">
          <h3>Allowlist / blocklist</h3>
          <p>Permit or block specific users or vehicles.</p>
        </div>
        <div className="card">
          <h3>Integration</h3>
          <p>Gates, barriers, app-based access; audit log.</p>
        </div>
      </div>
    </PropertyScreen>
  )
}
