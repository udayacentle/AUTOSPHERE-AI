import PropertyScreen from './PropertyScreen'

export default function PropertyAdminLogin() {
  return (
    <PropertyScreen
      title="Property Admin Login"
      subtitle="Secure access for property and parking administrators"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Admin credentials</h3>
          <p>Email, property ID, or SSO login.</p>
        </div>
        <div className="card">
          <h3>Property / site</h3>
          <p>Select property, lot, or building to manage.</p>
        </div>
      </div>
    </PropertyScreen>
  )
}
