import DriverScreen from './DriverScreen'

export default function Resale() {
  return (
    <DriverScreen
      title="Resale Value Estimator"
      subtitle="Estimated market value of your vehicle"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Current estimate</h3>
          <p>Based on make, model, year, condition</p>
        </div>
        <div className="card">
          <h3>Factors</h3>
          <p>Mileage, history, market</p>
        </div>
        <div className="card">
          <h3>Sell / trade-in</h3>
          <p>Options and next steps</p>
        </div>
      </div>
    </DriverScreen>
  )
}
