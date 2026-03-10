import DriverScreen from './DriverScreen'

export default function ServiceCenters() {
  return (
    <DriverScreen
      title="Nearby Service Centers & Booking"
      subtitle="Find and book workshops"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Map view</h3>
          <p>Nearby centers</p>
        </div>
        <div className="card">
          <h3>List & filters</h3>
          <p>Rating, distance, availability</p>
        </div>
        <div className="card">
          <h3>Book slot</h3>
          <p>Date, time, service type</p>
        </div>
      </div>
    </DriverScreen>
  )
}
