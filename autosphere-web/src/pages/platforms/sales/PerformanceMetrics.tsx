import SalesScreen from './SalesScreen'

export default function PerformanceMetrics() {
  return (
    <SalesScreen
      title="Performance Metrics"
      subtitle="Individual and team sales performance"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Conversion rates</h3>
          <p>Lead → qualified → proposal → won.</p>
        </div>
        <div className="card">
          <h3>Activity metrics</h3>
          <p>Calls made, meetings, test drives, proposals sent.</p>
        </div>
        <div className="card">
          <h3>Rankings</h3>
          <p>Leaderboard by volume, revenue, or target %.</p>
        </div>
      </div>
    </SalesScreen>
  )
}
