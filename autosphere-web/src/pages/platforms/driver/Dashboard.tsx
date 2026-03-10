import DriverScreen from './DriverScreen'

export default function Dashboard() {
  return (
    <DriverScreen
      title="Home Dashboard"
      subtitle="Your mobility overview at a glance"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Mobility Score</h3>
          <p>Current index: —</p>
        </div>
        <div className="card">
          <h3>Vehicle health</h3>
          <p>Status & alerts</p>
        </div>
        <div className="card">
          <h3>Recent trips</h3>
          <p>Last 7 days</p>
        </div>
        <div className="card">
          <h3>Upcoming service</h3>
          <p>Next maintenance</p>
        </div>
        <div className="card">
          <h3>Insurance</h3>
          <p>Policy & claims</p>
        </div>
        <div className="card">
          <h3>Quick actions</h3>
          <p>Parking, charging, roadside</p>
        </div>
      </div>
    </DriverScreen>
  )
}
