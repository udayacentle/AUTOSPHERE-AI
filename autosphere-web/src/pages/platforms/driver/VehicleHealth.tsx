import DriverScreen from './DriverScreen'

export default function VehicleHealth() {
  return (
    <DriverScreen
      title="Vehicle Health Breakdown"
      subtitle="Component-wise health status"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Engine</h3>
          <p>Status & diagnostics</p>
        </div>
        <div className="card">
          <h3>Battery</h3>
          <p>Charge, age, SOH</p>
        </div>
        <div className="card">
          <h3>Brakes & tires</h3>
          <p>Wear, pressure</p>
        </div>
        <div className="card">
          <h3>Fluids</h3>
          <p>Oil, coolant, etc.</p>
        </div>
        <div className="card">
          <h3>Electrical</h3>
          <p>Lights, sensors</p>
        </div>
      </div>
    </DriverScreen>
  )
}
