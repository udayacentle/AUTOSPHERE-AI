import PropertyScreen from './PropertyScreen'

export default function EVChargingControlPanel() {
  return (
    <PropertyScreen
      title="EV Charging Control Panel"
      subtitle="Monitor and control EV charging stations"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Station status</h3>
          <p>All chargers: available, in use, fault, offline.</p>
        </div>
        <div className="card">
          <h3>Remote control</h3>
          <p>Start/stop session, set limit, restart charger.</p>
        </div>
        <div className="card">
          <h3>Settings</h3>
          <p>Power limit, pricing, access rules per station.</p>
        </div>
      </div>
    </PropertyScreen>
  )
}
