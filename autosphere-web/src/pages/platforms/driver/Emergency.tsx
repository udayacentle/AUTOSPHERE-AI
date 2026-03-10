import DriverScreen from './DriverScreen'

export default function Emergency() {
  return (
    <DriverScreen
      title="Emergency & Accident Detection"
      subtitle="SOS, crash detection, emergency contacts"
    >
      <div className="card-grid">
        <div className="card">
          <h3>SOS button</h3>
          <p>Quick emergency alert</p>
        </div>
        <div className="card">
          <h3>Accident detection</h3>
          <p>Auto-detect & notify</p>
        </div>
        <div className="card">
          <h3>Emergency contacts</h3>
          <p>Family, police, insurer</p>
        </div>
      </div>
    </DriverScreen>
  )
}
