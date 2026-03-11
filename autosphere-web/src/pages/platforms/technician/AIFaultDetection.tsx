import TechnicianScreen from './TechnicianScreen'

export default function AIFaultDetection() {
  return (
    <TechnicianScreen
      title="AI Fault Detection"
      subtitle="AI-suggested faults and root cause"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Detected faults</h3>
          <p>AI-ranked list: likely cause, confidence, evidence.</p>
        </div>
        <div className="card">
          <h3>Root cause</h3>
          <p>Suggested primary fault and contributing factors.</p>
        </div>
        <div className="card">
          <h3>Similar cases</h3>
          <p>Past repairs for same symptoms or codes.</p>
        </div>
      </div>
    </TechnicianScreen>
  )
}
