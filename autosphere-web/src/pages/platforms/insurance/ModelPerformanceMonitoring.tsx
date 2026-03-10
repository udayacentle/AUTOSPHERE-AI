import InsuranceScreen from './InsuranceScreen'

export default function ModelPerformanceMonitoring() {
  return (
    <InsuranceScreen
      title="Model Performance Monitoring"
      subtitle="Monitor risk and fraud model accuracy"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Model metrics</h3>
          <p>Accuracy, precision, recall, AUC over time.</p>
        </div>
        <div className="card">
          <h3>Drift detection</h3>
          <p>Input and prediction distribution shifts.</p>
        </div>
        <div className="card">
          <h3>Version history</h3>
          <p>Model versions and A/B comparison.</p>
        </div>
      </div>
    </InsuranceScreen>
  )
}
