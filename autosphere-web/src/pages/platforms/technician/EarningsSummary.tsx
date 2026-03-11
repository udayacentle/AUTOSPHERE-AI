import TechnicianScreen from './TechnicianScreen'

export default function EarningsSummary() {
  return (
    <TechnicianScreen
      title="Earnings Summary"
      subtitle="Pay and commission by job and period"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Earnings by period</h3>
          <p>Daily, weekly, monthly; base + incentive.</p>
        </div>
        <div className="card">
          <h3>By job type</h3>
          <p>Labour units, flat rate, bonus jobs.</p>
        </div>
        <div className="card">
          <h3>Payout history</h3>
          <p>Past payouts, pending, next pay date.</p>
        </div>
      </div>
    </TechnicianScreen>
  )
}
