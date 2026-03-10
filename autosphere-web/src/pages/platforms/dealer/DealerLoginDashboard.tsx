import DealerScreen from './DealerScreen'

export default function DealerLoginDashboard() {
  return (
    <DealerScreen
      title="Dealer Login & Dashboard"
      subtitle="Secure access and overview for dealership staff"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Dealer credentials</h3>
          <p>Login with dealer ID, email, or SSO.</p>
        </div>
        <div className="card">
          <h3>Dashboard summary</h3>
          <p>Inventory count, leads, sales today, pipeline value.</p>
        </div>
        <div className="card">
          <h3>Quick actions</h3>
          <p>Add vehicle, new lead, view funnel.</p>
        </div>
      </div>
    </DealerScreen>
  )
}
