import DealerScreen from './DealerScreen'

export default function TradeInValuationTool() {
  return (
    <DealerScreen
      title="Trade-In Valuation Tool"
      subtitle="Instant trade-in value using vehicle data and market"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Vehicle input</h3>
          <p>VIN scan or manual entry, condition, mileage.</p>
        </div>
        <div className="card">
          <h3>Valuation result</h3>
          <p>Range, certified offer, link to digital twin if available.</p>
        </div>
        <div className="card">
          <h3>Deal builder</h3>
          <p>Apply trade-in to new vehicle deal, payment impact.</p>
        </div>
      </div>
    </DealerScreen>
  )
}
