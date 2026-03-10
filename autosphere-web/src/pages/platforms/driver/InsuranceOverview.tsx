import DriverScreen from './DriverScreen'

export default function InsuranceOverview() {
  return (
    <DriverScreen
      title="Insurance Overview & Premium Calculator"
      subtitle="Policy details and premium estimates"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Current policy</h3>
          <p>Provider, type, expiry</p>
        </div>
        <div className="card">
          <h3>Premium calculator</h3>
          <p>Get a quote</p>
        </div>
        <div className="card">
          <h3>Claims</h3>
          <p>File & track</p>
        </div>
      </div>
    </DriverScreen>
  )
}
