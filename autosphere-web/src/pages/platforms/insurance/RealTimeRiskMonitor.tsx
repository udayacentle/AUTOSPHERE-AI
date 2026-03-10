import InsuranceScreen from './InsuranceScreen'

export default function RealTimeRiskMonitor() {
  return (
    <InsuranceScreen
      title="Real-Time Risk Monitor"
      subtitle="Live risk indicators and alerts"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Live risk feed</h3>
          <p>Driver and vehicle risk events as they occur.</p>
        </div>
        <div className="card">
          <h3>Threshold alerts</h3>
          <p>Breaches and escalation rules.</p>
        </div>
        <div className="card">
          <h3>Risk score trends</h3>
          <p>Short-term spikes and regional view.</p>
        </div>
      </div>
    </InsuranceScreen>
  )
}
