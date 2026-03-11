import TechnicianScreen from './TechnicianScreen'

export default function TechnicianPerformanceScore() {
  return (
    <TechnicianScreen
      title="Technician Performance Score"
      subtitle="Quality, speed, and efficiency metrics"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Score breakdown</h3>
          <p>First-time fix rate, rework %, customer rating.</p>
        </div>
        <div className="card">
          <h3>Trends</h3>
          <p>Score over time; comparison to workshop average.</p>
        </div>
        <div className="card">
          <h3>Goals & feedback</h3>
          <p>Targets and improvement suggestions.</p>
        </div>
      </div>
    </TechnicianScreen>
  )
}
