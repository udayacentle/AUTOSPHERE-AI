import DealerScreen from './DealerScreen'

export default function DemandForecastDashboard() {
  return (
    <DealerScreen
      title="Demand Forecast Dashboard"
      subtitle="Demand and sales forecasts by segment"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Demand by segment</h3>
          <p>Make, model, body type, price band.</p>
        </div>
        <div className="card">
          <h3>Time horizon</h3>
          <p>Weekly, monthly, quarterly forecasts.</p>
        </div>
        <div className="card">
          <h3>Inventory alignment</h3>
          <p>Gap between forecast demand and current stock.</p>
        </div>
      </div>
    </DealerScreen>
  )
}
