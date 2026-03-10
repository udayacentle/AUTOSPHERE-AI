import DriverScreen from './DriverScreen'

export default function PredictiveMaintenance() {
  return (
    <DriverScreen
      title="Predictive Maintenance Alerts"
      subtitle="AI-predicted maintenance and due dates"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Upcoming</h3>
          <p>Next suggested service</p>
        </div>
        <div className="card">
          <h3>Alerts</h3>
          <p>Critical / warning items</p>
        </div>
        <div className="card">
          <h3>Schedule</h3>
          <p>Book with workshop</p>
        </div>
      </div>
    </DriverScreen>
  )
}
