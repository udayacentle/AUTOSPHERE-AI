import AnalyticsScreen from './AnalyticsScreen'

export default function PredictiveForecastCharts() {
  return (
    <AnalyticsScreen
      title="Predictive Forecast Charts"
      subtitle="AI-driven forecasts for demand, risk, and outcomes"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Forecast types</h3>
          <p>Demand, risk, sales, claims, emissions, occupancy.</p>
        </div>
        <div className="card">
          <h3>Charts</h3>
          <p>Historical + forecast; confidence intervals; scenarios.</p>
        </div>
        <div className="card">
          <h3>Parameters</h3>
          <p>Horizon, segment, model version; export data.</p>
        </div>
      </div>
    </AnalyticsScreen>
  )
}
