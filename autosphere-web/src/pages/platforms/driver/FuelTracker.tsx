import DriverScreen from './DriverScreen'

export default function FuelTracker() {
  return (
    <DriverScreen
      title="Fuel Efficiency & Carbon Tracker"
      subtitle="Consumption and carbon footprint"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Fuel efficiency</h3>
          <p>km/L or L/100km</p>
        </div>
        <div className="card">
          <h3>Carbon footprint</h3>
          <p>CO₂ this month</p>
        </div>
        <div className="card">
          <h3>Log refuels</h3>
          <p>Amount, cost, odometer</p>
        </div>
      </div>
    </DriverScreen>
  )
}
