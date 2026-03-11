import GovernmentScreen from './GovernmentScreen'

export default function RiskZoneAnalytics() {
  return (
    <GovernmentScreen
      title="Risk Zone Analytics"
      subtitle="Analyze and compare risk across zones and segments"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Zone risk score</h3>
          <p>Per zone: accidents, violations, claims, severity.</p>
        </div>
        <div className="card">
          <h3>Comparisons</h3>
          <p>Zone vs zone; before/after policy; segment.</p>
        </div>
        <div className="card">
          <h3>Export & share</h3>
          <p>Reports, maps, data export for policy use.</p>
        </div>
      </div>
    </GovernmentScreen>
  )
}
