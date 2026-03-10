import DriverScreen from './DriverScreen'

export default function Parking() {
  return (
    <DriverScreen
      title="Parking Map & Booking"
      subtitle="Find and reserve parking"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Map</h3>
          <p>Available lots</p>
        </div>
        <div className="card">
          <h3>Book slot</h3>
          <p>Time, duration, price</p>
        </div>
        <div className="card">
          <h3>Active booking</h3>
          <p>Current reservation</p>
        </div>
      </div>
    </DriverScreen>
  )
}
