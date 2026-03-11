import TechnicianScreen from './TechnicianScreen'

export default function RepairTimeEstimator() {
  return (
    <TechnicianScreen
      title="Repair Time Estimator"
      subtitle="Estimate and track repair duration"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Estimated time</h3>
          <p>AI or manual estimate: diagnosis + repair + test.</p>
        </div>
        <div className="card">
          <h3>Actual time</h3>
          <p>Logged start/end; compare to estimate.</p>
        </div>
        <div className="card">
          <h3>Customer ETA</h3>
          <p>Expected completion; notify driver when ready.</p>
        </div>
      </div>
    </TechnicianScreen>
  )
}
