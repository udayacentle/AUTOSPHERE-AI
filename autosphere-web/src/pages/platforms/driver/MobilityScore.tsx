import DriverScreen from './DriverScreen'

export default function MobilityScore() {
  return (
    <DriverScreen
      title="Mobility Score (Vehicle Intelligence Index)"
      subtitle="AI-powered score based on driving, vehicle health, and usage"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Overall score</h3>
          <p>0–100 index</p>
        </div>
        <div className="card">
          <h3>Driving behavior</h3>
          <p>Safety & efficiency</p>
        </div>
        <div className="card">
          <h3>Vehicle condition</h3>
          <p>Health & maintenance</p>
        </div>
        <div className="card">
          <h3>Usage patterns</h3>
          <p>Trips, fuel, carbon</p>
        </div>
        <div className="card">
          <h3>Recommendations</h3>
          <p>Improve your score</p>
        </div>
      </div>
    </DriverScreen>
  )
}
