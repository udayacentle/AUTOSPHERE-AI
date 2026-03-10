import InsuranceScreen from './InsuranceScreen'

export default function AIFraudDetectionGraphView() {
  return (
    <InsuranceScreen
      title="AI Fraud Detection Graph View"
      subtitle="Visualize fraud patterns and linked claims"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Fraud graph</h3>
          <p>Entities, claims, and relationships (network view).</p>
        </div>
        <div className="card">
          <h3>Risk flags</h3>
          <p>AI-scored likelihood and evidence.</p>
        </div>
        <div className="card">
          <h3>Investigation queue</h3>
          <p>Prioritized cases for review.</p>
        </div>
      </div>
    </InsuranceScreen>
  )
}
