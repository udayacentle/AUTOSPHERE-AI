import InsuranceScreen from './InsuranceScreen'

export default function ClaimsManagementDashboard() {
  return (
    <InsuranceScreen
      title="Claims Management Dashboard"
      subtitle="Claims pipeline, status, and payouts"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Open claims</h3>
          <p>Queue by status: submitted, assessing, approved, paid.</p>
        </div>
        <div className="card">
          <h3>AI damage assessment</h3>
          <p>Photo-based estimates and fraud flags.</p>
        </div>
        <div className="card">
          <h3>Payout summary</h3>
          <p>Total paid, reserved, and average claim size.</p>
        </div>
        <div className="card">
          <h3>Actions</h3>
          <p>Approve, reject, request more info.</p>
        </div>
      </div>
    </InsuranceScreen>
  )
}
