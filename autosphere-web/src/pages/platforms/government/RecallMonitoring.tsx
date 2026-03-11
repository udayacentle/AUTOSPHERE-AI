import GovernmentScreen from './GovernmentScreen'

export default function RecallMonitoring() {
  return (
    <GovernmentScreen
      title="Recall Monitoring"
      subtitle="Track vehicle recalls and remediation status"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Active recalls</h3>
          <p>OEM recalls: affected VINs, component, risk level.</p>
        </div>
        <div className="card">
          <h3>Remediation status</h3>
          <p>% vehicles fixed; by region, dealer, timeline.</p>
        </div>
        <div className="card">
          <h3>Alerts & escalation</h3>
          <p>Overdue recalls; non-compliance; notifications.</p>
        </div>
      </div>
    </GovernmentScreen>
  )
}
