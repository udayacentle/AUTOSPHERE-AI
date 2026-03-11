import PropertyScreen from './PropertyScreen'

export default function PeakTrafficPrediction() {
  return (
    <PropertyScreen
      title="Peak Traffic Prediction"
      subtitle="AI-predicted demand and peak times"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Demand forecast</h3>
          <p>Expected occupancy and charging demand by hour/day.</p>
        </div>
        <div className="card">
          <h3>Peak windows</h3>
          <p>Suggested peak periods; pricing recommendations.</p>
        </div>
        <div className="card">
          <h3>Capacity planning</h3>
          <p>When to add capacity or restrict access.</p>
        </div>
      </div>
    </PropertyScreen>
  )
}
