import AIAdminScreen from './AIAdminScreen'

export default function ModelAccuracyDashboard() {
  return (
    <AIAdminScreen
      title="Model Accuracy Dashboard"
      subtitle="Accuracy, precision, recall, and related metrics"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Metrics</h3>
          <p>Accuracy, precision, recall, F1, AUC by model and time.</p>
        </div>
        <div className="card">
          <h3>Confusion matrix</h3>
          <p>Per-model confusion matrix; segment breakdown.</p>
        </div>
        <div className="card">
          <h3>Trends</h3>
          <p>Metric over time; compare versions.</p>
        </div>
      </div>
    </AIAdminScreen>
  )
}
