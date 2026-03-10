import InsuranceScreen from './InsuranceScreen'

export default function PredictiveLossForecasting() {
  return (
    <InsuranceScreen
      title="Predictive Loss Forecasting"
      subtitle="AI-driven loss and reserve forecasts"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Loss forecast</h3>
          <p>Expected losses by period and segment.</p>
        </div>
        <div className="card">
          <h3>Reserve recommendations</h3>
          <p>IBNR and case reserve suggestions.</p>
        </div>
        <div className="card">
          <h3>Scenario analysis</h3>
          <p>Stress tests and sensitivity.</p>
        </div>
      </div>
    </InsuranceScreen>
  )
}
