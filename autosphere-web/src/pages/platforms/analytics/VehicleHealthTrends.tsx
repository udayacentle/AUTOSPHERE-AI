import AnalyticsScreen from './AnalyticsScreen'

export default function VehicleHealthTrends() {
  return (
    <AnalyticsScreen
      title="Vehicle Health Trends"
      subtitle="Aggregate vehicle health and maintenance trends"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Health metrics</h3>
          <p>Average health score, fault rate, upcoming maintenance %.</p>
        </div>
        <div className="card">
          <h3>By segment</h3>
          <p>By make, model, age, mileage, region.</p>
        </div>
        <div className="card">
          <h3>Charts</h3>
          <p>Trend over time; breakdown by component or alert type.</p>
        </div>
      </div>
    </AnalyticsScreen>
  )
}
