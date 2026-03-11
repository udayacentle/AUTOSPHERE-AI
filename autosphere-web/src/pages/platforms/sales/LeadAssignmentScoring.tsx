import SalesScreen from './SalesScreen'

export default function LeadAssignmentScoring() {
  return (
    <SalesScreen
      title="Lead Assignment & Scoring"
      subtitle="Assign and score incoming leads"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Lead queue</h3>
          <p>New leads from website, walk-ins, referrals.</p>
        </div>
        <div className="card">
          <h3>Scoring rules</h3>
          <p>AI or rule-based score: budget, intent, vehicle interest.</p>
        </div>
        <div className="card">
          <h3>Assignment</h3>
          <p>Auto-assign by availability or manual assign to rep.</p>
        </div>
      </div>
    </SalesScreen>
  )
}
