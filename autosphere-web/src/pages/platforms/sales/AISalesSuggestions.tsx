import SalesScreen from './SalesScreen'

export default function AISalesSuggestions() {
  return (
    <SalesScreen
      title="AI Sales Suggestions"
      subtitle="AI-powered next-best-action and talking points"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Next best action</h3>
          <p>Suggested follow-up: call, email, offer, vehicle match.</p>
        </div>
        <div className="card">
          <h3>Talking points</h3>
          <p>Per-lead or per-vehicle prompts and objections.</p>
        </div>
        <div className="card">
          <h3>Vehicle recommendations</h3>
          <p>Match inventory to customer preference and budget.</p>
        </div>
      </div>
    </SalesScreen>
  )
}
