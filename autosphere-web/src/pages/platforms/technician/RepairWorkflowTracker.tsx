import TechnicianScreen from './TechnicianScreen'

export default function RepairWorkflowTracker() {
  return (
    <TechnicianScreen
      title="Repair Workflow Tracker"
      subtitle="Track repair stages and time"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Workflow stages</h3>
          <p>Diagnose → Parts → Repair → Test → Complete.</p>
        </div>
        <div className="card">
          <h3>Time per stage</h3>
          <p>Actual vs estimated; delay reasons.</p>
        </div>
        <div className="card">
          <h3>Customer visibility</h3>
          <p>Live status for driver app (e.g. in progress, testing).</p>
        </div>
      </div>
    </TechnicianScreen>
  )
}
