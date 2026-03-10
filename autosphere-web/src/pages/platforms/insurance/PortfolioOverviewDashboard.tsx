import InsuranceScreen from './InsuranceScreen'

export default function PortfolioOverviewDashboard() {
  return (
    <InsuranceScreen
      title="Portfolio Overview Dashboard"
      subtitle="High-level view of risk, claims, and premiums"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Active policies</h3>
          <p>Count and total premium by segment.</p>
        </div>
        <div className="card">
          <h3>Risk exposure</h3>
          <p>Aggregate risk score and trends.</p>
        </div>
        <div className="card">
          <h3>Claims summary</h3>
          <p>Open claims, payouts, loss ratio.</p>
        </div>
        <div className="card">
          <h3>Compliance status</h3>
          <p>Regulatory and reporting overview.</p>
        </div>
      </div>
    </InsuranceScreen>
  )
}
