import TechnicianScreen from './TechnicianScreen'

export default function TechnicianLogin() {
  return (
    <TechnicianScreen
      title="Technician Login"
      subtitle="Secure access for workshop technicians"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Credentials</h3>
          <p>Technician ID, email, or SSO login.</p>
        </div>
        <div className="card">
          <h3>Workshop / bay</h3>
          <p>Assign to workshop location and bay.</p>
        </div>
      </div>
    </TechnicianScreen>
  )
}
