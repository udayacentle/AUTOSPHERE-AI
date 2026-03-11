import AnalyticsScreen from './AnalyticsScreen'

export default function AIModelComparisonDashboard() {
  return (
    <AnalyticsScreen
      title="AI Model Comparison Dashboard"
      subtitle="Compare accuracy and performance across AI models"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Model list</h3>
          <p>Risk, fraud, demand, forecasting models; version, status.</p>
        </div>
        <div className="card">
          <h3>Compare metrics</h3>
          <p>Accuracy, precision, recall, latency; side-by-side.</p>
        </div>
        <div className="card">
          <h3>A/B and champion</h3>
          <p>Champion vs challenger; promote or rollback.</p>
        </div>
      </div>
    </AnalyticsScreen>
  )
}
