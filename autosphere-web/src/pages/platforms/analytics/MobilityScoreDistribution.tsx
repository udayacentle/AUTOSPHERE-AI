import AnalyticsScreen from './AnalyticsScreen'

export default function MobilityScoreDistribution() {
  return (
    <AnalyticsScreen
      title="Mobility Score Distribution"
      subtitle="Distribution of mobility scores across drivers and fleet"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Distribution chart</h3>
          <p>Histogram or curve: score bands, percentiles.</p>
        </div>
        <div className="card">
          <h3>By segment</h3>
          <p>By region, vehicle type, insurer, fleet.</p>
        </div>
        <div className="card">
          <h3>Trends</h3>
          <p>Distribution over time; improvement or degradation.</p>
        </div>
      </div>
    </AnalyticsScreen>
  )
}
