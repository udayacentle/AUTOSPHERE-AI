import TechnicianScreen from './TechnicianScreen'

export default function ARAssistanceView() {
  return (
    <TechnicianScreen
      title="AR Assistance View"
      subtitle="Augmented reality guidance for repairs"
    >
      <div className="card-grid">
        <div className="card">
          <h3>AR overlay</h3>
          <p>Step-by-step overlay on engine bay or component.</p>
        </div>
        <div className="card">
          <h3>Highlight & annotate</h3>
          <p>Point to bolts, connectors, and removal order.</p>
        </div>
        <div className="card">
          <h3>Device support</h3>
          <p>Tablet or AR glasses; camera feed + overlay.</p>
        </div>
      </div>
    </TechnicianScreen>
  )
}
