import GovernmentScreen from './GovernmentScreen'

export default function AccidentClusterPrediction() {
  return (
    <GovernmentScreen
      title="Accident Cluster Prediction"
      subtitle="AI-predicted high-risk zones and accident clusters"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Cluster map</h3>
          <p>Historical accident clusters; predicted risk zones.</p>
        </div>
        <div className="card">
          <h3>Risk factors</h3>
          <p>Road type, weather, time, traffic; contributing factors.</p>
        </div>
        <div className="card">
          <h3>Intervention suggestions</h3>
          <p>Suggested signage, speed limits, or infrastructure.</p>
        </div>
      </div>
    </GovernmentScreen>
  )
}
