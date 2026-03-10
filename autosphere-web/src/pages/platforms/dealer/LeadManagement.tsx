import DealerScreen from './DealerScreen'

export default function LeadManagement() {
  return (
    <DealerScreen
      title="Lead Management"
      subtitle="Incoming leads, assignment, and follow-up"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Lead queue</h3>
          <p>New, assigned, contacted, qualified, lost.</p>
        </div>
        <div className="card">
          <h3>Assignment & scoring</h3>
          <p>Auto or manual assign, lead score, source.</p>
        </div>
        <div className="card">
          <h3>Activity log</h3>
          <p>Calls, emails, test drives, next steps.</p>
        </div>
      </div>
    </DealerScreen>
  )
}
