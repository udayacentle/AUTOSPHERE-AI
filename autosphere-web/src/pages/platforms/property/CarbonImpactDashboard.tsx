import PropertyScreen from './PropertyScreen'

export default function CarbonImpactDashboard() {
  return (
    <PropertyScreen
      title="Carbon Impact Dashboard"
      subtitle="Carbon savings from EV charging and parking"
    >
      <div className="card-grid">
        <div className="card">
          <h3>EV energy delivered</h3>
          <p>kWh delivered; equivalent CO₂ avoided vs ICE.</p>
        </div>
        <div className="card">
          <h3>Trends</h3>
          <p>Daily, monthly carbon impact; goals.</p>
        </div>
        <div className="card">
          <h3>Reporting</h3>
          <p>Export for ESG or sustainability reports.</p>
        </div>
      </div>
    </PropertyScreen>
  )
}
