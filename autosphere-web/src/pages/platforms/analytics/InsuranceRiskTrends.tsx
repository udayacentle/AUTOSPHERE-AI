import AnalyticsScreen from './AnalyticsScreen'

export default function InsuranceRiskTrends() {
  return (
    <AnalyticsScreen
      title="Insurance Risk Trends"
      subtitle="Risk score and loss trends across insurance portfolio"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Risk metrics</h3>
          <p>Average risk score, loss ratio, claim frequency/severity.</p>
        </div>
        <div className="card">
          <h3>By segment</h3>
          <p>By product, region, vehicle type, driver tier.</p>
        </div>
        <div className="card">
          <h3>Trends</h3>
          <p>Risk over time; impact of pricing or policy changes.</p>
        </div>
      </div>
    </AnalyticsScreen>
  )
}
