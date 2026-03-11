import AnalyticsScreen from './AnalyticsScreen'

export default function TechnicianPerformanceTrends() {
  return (
    <AnalyticsScreen
      title="Technician Performance Trends"
      subtitle="Technician quality, speed, and efficiency trends"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Performance metrics</h3>
          <p>First-time fix rate, rework %, avg repair time, score.</p>
        </div>
        <div className="card">
          <h3>By workshop / region</h3>
          <p>Compare workshops; top performers.</p>
        </div>
        <div className="card">
          <h3>Trends</h3>
          <p>Performance over time; training or process impact.</p>
        </div>
      </div>
    </AnalyticsScreen>
  )
}
