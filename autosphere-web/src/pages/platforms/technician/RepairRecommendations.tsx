import TechnicianScreen from './TechnicianScreen'

export default function RepairRecommendations() {
  return (
    <TechnicianScreen
      title="Repair Recommendations"
      subtitle="Suggested repair steps and procedures"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Procedure steps</h3>
          <p>Recommended sequence: inspect, replace, test.</p>
        </div>
        <div className="card">
          <h3>Parts & labour</h3>
          <p>Suggested parts list and estimated labour time.</p>
        </div>
        <div className="card">
          <h3>Manual links</h3>
          <p>OEM or internal procedure documents.</p>
        </div>
      </div>
    </TechnicianScreen>
  )
}
