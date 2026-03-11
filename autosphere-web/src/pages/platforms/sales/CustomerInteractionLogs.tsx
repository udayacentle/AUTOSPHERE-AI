import SalesScreen from './SalesScreen'

export default function CustomerInteractionLogs() {
  return (
    <SalesScreen
      title="Customer Interaction Logs"
      subtitle="Log and view all customer touchpoints"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Activity log</h3>
          <p>Calls, emails, test drives, showroom visits.</p>
        </div>
        <div className="card">
          <h3>Notes & next steps</h3>
          <p>Per-customer notes and scheduled follow-ups.</p>
        </div>
        <div className="card">
          <h3>History view</h3>
          <p>Timeline of interactions by lead or deal.</p>
        </div>
      </div>
    </SalesScreen>
  )
}
