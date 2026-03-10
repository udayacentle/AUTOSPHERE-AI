import DealerScreen from './DealerScreen'

export default function CommissionManagement() {
  return (
    <DealerScreen
      title="Commission Management"
      subtitle="Commission rules and payouts"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Commission rules</h3>
          <p>By vehicle type, margin, volume tiers, bonuses.</p>
        </div>
        <div className="card">
          <h3>Calculated commission</h3>
          <p>Per deal, per salesperson, period summary.</p>
        </div>
        <div className="card">
          <h3>Payout status</h3>
          <p>Pending, approved, paid, dispute.</p>
        </div>
      </div>
    </DealerScreen>
  )
}
