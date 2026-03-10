import InsuranceScreen from './InsuranceScreen'

export default function DriverRiskProfileView() {
  return (
    <InsuranceScreen
      title="Driver Risk Profile View"
      subtitle="Per-driver risk score and behavior insights"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Risk score</h3>
          <p>Mobility index, driving style, claims history.</p>
        </div>
        <div className="card">
          <h3>Behavior breakdown</h3>
          <p>Trips, speed, braking, time of day.</p>
        </div>
        <div className="card">
          <h3>Premium impact</h3>
          <p>How risk affects current and suggested premium.</p>
        </div>
      </div>
    </InsuranceScreen>
  )
}
