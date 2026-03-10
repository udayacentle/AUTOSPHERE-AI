import InsuranceScreen from './InsuranceScreen'

export default function PolicyManagement() {
  return (
    <InsuranceScreen
      title="Policy Management"
      subtitle="Create, renew, and manage policies"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Policy list</h3>
          <p>Search, filter, status (active, lapsed, pending).</p>
        </div>
        <div className="card">
          <h3>Policy details</h3>
          <p>Coverage, driver, vehicle, premium, documents.</p>
        </div>
        <div className="card">
          <h3>Endorsements</h3>
          <p>Mid-term changes and renewals.</p>
        </div>
      </div>
    </InsuranceScreen>
  )
}
