import GovernmentScreen from './GovernmentScreen'

export default function RegionalReports() {
  return (
    <GovernmentScreen
      title="Regional Reports"
      subtitle="Pre-built and custom reports by region"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Report catalog</h3>
          <p>Safety, emissions, compliance, fleet by region.</p>
        </div>
        <div className="card">
          <h3>Parameters</h3>
          <p>Select region, period, metrics, format.</p>
        </div>
        <div className="card">
          <h3>Schedule & delivery</h3>
          <p>One-time or recurring; email, portal, API.</p>
        </div>
      </div>
    </GovernmentScreen>
  )
}
