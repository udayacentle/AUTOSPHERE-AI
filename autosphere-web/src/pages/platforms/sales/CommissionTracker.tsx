import SalesScreen from './SalesScreen'

export default function CommissionTracker() {
  return (
    <SalesScreen
      title="Commission Tracker"
      subtitle="Track earned and pending commission"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Earned commission</h3>
          <p>By deal, by period, by vehicle or product.</p>
        </div>
        <div className="card">
          <h3>Pending</h3>
          <p>Deals in progress — commission on delivery.</p>
        </div>
        <div className="card">
          <h3>Payout history</h3>
          <p>Past payouts and payment schedule.</p>
        </div>
      </div>
    </SalesScreen>
  )
}
