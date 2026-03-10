import DriverScreen from './DriverScreen'

export default function TechnicianProfile() {
  return (
    <DriverScreen
      title="Technician Profile View"
      subtitle="Assigned technician details"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Name & photo</h3>
          <p>Technician info</p>
        </div>
        <div className="card">
          <h3>Rating & reviews</h3>
          <p>Past jobs</p>
        </div>
        <div className="card">
          <h3>Contact</h3>
          <p>Call / chat</p>
        </div>
      </div>
    </DriverScreen>
  )
}
