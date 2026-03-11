import AIAdminScreen from './AIAdminScreen'

export default function SystemHealthDashboard() {
  return (
    <AIAdminScreen
      title="System Health Dashboard"
      subtitle="Infrastructure and service health"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Services</h3>
          <p>API, ML serving, DB, queue; status and uptime.</p>
        </div>
        <div className="card">
          <h3>Resources</h3>
          <p>CPU, memory, disk; per service or node.</p>
        </div>
        <div className="card">
          <h3>Dependencies</h3>
          <p>Third-party APIs, DBs; latency and errors.</p>
        </div>
      </div>
    </AIAdminScreen>
  )
}
