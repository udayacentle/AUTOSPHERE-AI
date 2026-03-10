import DriverScreen from './DriverScreen'

export default function VehicleDetails() {
  return (
    <DriverScreen
      title="Vehicle Details & Digital Twin View"
      subtitle="Real-time digital twin of your vehicle"
    >
      <div className="card-grid">
        <div className="card">
          <h3>3D / model view</h3>
          <p>Digital twin visualization</p>
        </div>
        <div className="card">
          <h3>Specifications</h3>
          <p>Make, model, VIN, engine</p>
        </div>
        <div className="card">
          <h3>Live data</h3>
          <p>Odometer, fuel, alerts</p>
        </div>
        <div className="card">
          <h3>Documents</h3>
          <p>RC, insurance, PUC</p>
        </div>
      </div>
    </DriverScreen>
  )
}
