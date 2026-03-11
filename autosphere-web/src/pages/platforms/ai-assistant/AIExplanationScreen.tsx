import AIAssistantScreen from './AIAssistantScreen'

export default function AIExplanationScreen() {
  return (
    <AIAssistantScreen
      title="AI Explanation Screen (Why This Score?)"
      subtitle="Explain how a score or recommendation was derived"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Score breakdown</h3>
          <p>Factors that contributed: driving, vehicle, claims, etc.</p>
        </div>
        <div className="card">
          <h3>Visualization</h3>
          <p>Chart or list of factors with weight or impact.</p>
        </div>
        <div className="card">
          <h3>Improvement tips</h3>
          <p>What to do to improve score or outcome.</p>
        </div>
      </div>
    </AIAssistantScreen>
  )
}
