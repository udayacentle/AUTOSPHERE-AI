import PropertyScreen from './PropertyScreen'

export default function PropertyDashboard() {
  return (
    <PropertyScreen
      title="Property Dashboard"
      subtitle="Overview of parking, EV charging, and revenue"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Occupancy</h3>
          <p>Current parking and EV charger utilization.</p>
        </div>
        <div className="card">
          <h3>Revenue today</h3>
          <p>Parking and charging revenue summary.</p>
        </div>
        <div className="card">
          <h3>Alerts</h3>
          <p>Faults, capacity, load alerts.</p>
        </div>
      </div>
    </PropertyScreen>
  )
}
