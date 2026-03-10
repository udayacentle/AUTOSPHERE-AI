import DriverScreen from './DriverScreen'

export default function LiveRepair() {
  return (
    <DriverScreen
      title="Live Repair Tracking"
      subtitle="Real-time repair status"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Current status</h3>
          <p>In progress / completed</p>
        </div>
        <div className="card">
          <h3>Steps</h3>
          <p>Diagnosis → repair → QC</p>
        </div>
        <div className="card">
          <h3>Estimated time</h3>
          <p>ETA to completion</p>
        </div>
      </div>
    </DriverScreen>
  )
}
