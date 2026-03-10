import DriverScreen from './DriverScreen'

export default function DrivingAnalytics() {
  return (
    <DriverScreen
      title="Driving Analytics & Risk Exposure"
      subtitle="Behavior, risk score, and tips"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Risk score</h3>
          <p>Exposure & factors</p>
        </div>
        <div className="card">
          <h3>Behavior</h3>
          <p>Speed, braking, turns</p>
        </div>
        <div className="card">
          <h3>Time of day</h3>
          <p>Riskiest periods</p>
        </div>
        <div className="card">
          <h3>Recommendations</h3>
          <p>Reduce risk</p>
        </div>
      </div>
    </DriverScreen>
  )
}
