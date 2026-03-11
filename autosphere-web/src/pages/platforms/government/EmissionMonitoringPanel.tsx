import GovernmentScreen from './GovernmentScreen'

export default function EmissionMonitoringPanel() {
  return (
    <GovernmentScreen
      title="Emission Monitoring Panel"
      subtitle="Track emissions and environmental compliance"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Emission metrics</h3>
          <p>CO₂, NOx, particulate; by fleet, region, vehicle type.</p>
        </div>
        <div className="card">
          <h3>Targets vs actual</h3>
          <p>National or regional targets; progress and gaps.</p>
        </div>
        <div className="card">
          <h3>Trends & forecasts</h3>
          <p>Historical and predicted emission trajectory.</p>
        </div>
      </div>
    </GovernmentScreen>
  )
}
