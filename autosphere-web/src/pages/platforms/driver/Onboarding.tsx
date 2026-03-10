import DriverScreen from './DriverScreen'

export default function Onboarding() {
  return (
    <DriverScreen
      title="Onboarding & Profile Setup"
      subtitle="Complete your profile and preferences"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Personal details</h3>
          <p>Name, contact, address</p>
        </div>
        <div className="card">
          <h3>Vehicle registration</h3>
          <p>Link your vehicle(s)</p>
        </div>
        <div className="card">
          <h3>Preferences</h3>
          <p>Notifications, units, language</p>
        </div>
        <div className="card">
          <h3>Document upload</h3>
          <p>License, insurance</p>
        </div>
      </div>
    </DriverScreen>
  )
}
