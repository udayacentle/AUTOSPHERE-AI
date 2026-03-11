import AnalyticsScreen from './AnalyticsScreen'

export default function GlobalPerformanceDashboard() {
  return (
    <AnalyticsScreen
      title="Global Performance Dashboard"
      subtitle="Cross-platform KPIs and performance at a glance"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Key metrics</h3>
          <p>Mobility scores, vehicle health, risk, sales, revenue, emissions.</p>
        </div>
        <div className="card">
          <h3>By platform</h3>
          <p>Driver, Insurance, Dealer, Technician, Property, Government.</p>
        </div>
        <div className="card">
          <h3>Time range</h3>
          <p>Real-time, daily, weekly, monthly; compare periods.</p>
        </div>
      </div>
    </AnalyticsScreen>
  )
}
