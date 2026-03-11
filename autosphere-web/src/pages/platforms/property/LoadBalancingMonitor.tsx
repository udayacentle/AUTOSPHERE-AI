import PropertyScreen from './PropertyScreen'

export default function LoadBalancingMonitor() {
  return (
    <PropertyScreen
      title="Load Balancing Monitor"
      subtitle="Electrical load and grid balance across chargers"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Load view</h3>
          <p>Total draw, per circuit, per station; capacity.</p>
        </div>
        <div className="card">
          <h3>Balance actions</h3>
          <p>Throttle or queue sessions to stay within limit.</p>
        </div>
        <div className="card">
          <h3>Alerts</h3>
          <p>Overload, imbalance, grid constraint warnings.</p>
        </div>
      </div>
    </PropertyScreen>
  )
}
