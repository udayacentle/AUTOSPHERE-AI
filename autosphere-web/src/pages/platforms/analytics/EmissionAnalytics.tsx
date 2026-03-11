import AnalyticsScreen from './AnalyticsScreen'

export default function EmissionAnalytics() {
  return (
    <AnalyticsScreen
      title="Emission Analytics"
      subtitle="Aggregate emission and environmental metrics"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Emission metrics</h3>
          <p>CO₂, NOx, particulate; total and per vehicle/km.</p>
        </div>
        <div className="card">
          <h3>By segment</h3>
          <p>By region, vehicle type, fuel type, fleet.</p>
        </div>
        <div className="card">
          <h3>Trends & targets</h3>
          <p>Emission over time; vs targets; EV adoption impact.</p>
        </div>
      </div>
    </AnalyticsScreen>
  )
}
