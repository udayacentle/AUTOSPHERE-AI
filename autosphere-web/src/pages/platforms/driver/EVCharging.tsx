import DriverScreen from './DriverScreen'

export default function EVCharging() {
  return (
    <DriverScreen
      title="EV Charging Booking & Usage Analytics"
      subtitle="Find chargers, book, and view usage"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Find chargers</h3>
          <p>Map, availability, type</p>
        </div>
        <div className="card">
          <h3>Book slot</h3>
          <p>Reserve connector</p>
        </div>
        <div className="card">
          <h3>Usage analytics</h3>
          <p>kWh, cost, sessions</p>
        </div>
      </div>
    </DriverScreen>
  )
}
