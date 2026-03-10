import InsuranceScreen from './InsuranceScreen'

export default function RiskHeatmaps() {
  return (
    <InsuranceScreen
      title="Risk Heatmaps"
      subtitle="Geographic and segment risk visualization"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Region heatmap</h3>
          <p>Risk density by area (accidents, claims).</p>
        </div>
        <div className="card">
          <h3>Time / segment</h3>
          <p>Risk by hour, day, vehicle type.</p>
        </div>
        <div className="card">
          <h3>Filters</h3>
          <p>Date range, product, coverage type.</p>
        </div>
      </div>
    </InsuranceScreen>
  )
}
