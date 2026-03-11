import TechnicianScreen from './TechnicianScreen'

export default function JobQueueDashboard() {
  return (
    <TechnicianScreen
      title="Job Queue Dashboard"
      subtitle="Assigned jobs and repair queue"
    >
      <div className="card-grid">
        <div className="card">
          <h3>My jobs</h3>
          <p>Assigned repairs: pending, in progress, completed.</p>
        </div>
        <div className="card">
          <h3>Queue view</h3>
          <p>Priority, vehicle, estimated time, status.</p>
        </div>
        <div className="card">
          <h3>Pick next job</h3>
          <p>Start repair, view details, link to digital twin.</p>
        </div>
      </div>
    </TechnicianScreen>
  )
}
