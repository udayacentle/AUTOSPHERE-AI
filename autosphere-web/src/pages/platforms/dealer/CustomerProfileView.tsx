import DealerScreen from './DealerScreen'

export default function CustomerProfileView() {
  return (
    <DealerScreen
      title="Customer Profile View"
      subtitle="Unified view of customer and interaction history"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Contact & preferences</h3>
          <p>Name, contact, preferred make/model, budget.</p>
        </div>
        <div className="card">
          <h3>History</h3>
          <p>Visits, test drives, quotes, past purchases.</p>
        </div>
        <div className="card">
          <h3>Linked vehicles</h3>
          <p>Current vehicle, trade-in, vehicles of interest.</p>
        </div>
      </div>
    </DealerScreen>
  )
}
