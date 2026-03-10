import DriverScreen from './DriverScreen'

export default function Roadside() {
  return (
    <DriverScreen
      title="Roadside Assistance"
      subtitle="Request help on the road"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Request assistance</h3>
          <p>Towing, battery, flat tire</p>
        </div>
        <div className="card">
          <h3>Location</h3>
          <p>Share live location</p>
        </div>
        <div className="card">
          <h3>Status</h3>
          <p>ETA, helper details</p>
        </div>
      </div>
    </DriverScreen>
  )
}
