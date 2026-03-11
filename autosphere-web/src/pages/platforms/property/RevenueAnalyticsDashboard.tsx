import PropertyScreen from './PropertyScreen'

export default function RevenueAnalyticsDashboard() {
  return (
    <PropertyScreen
      title="Revenue Analytics Dashboard"
      subtitle="Revenue from parking and EV charging"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Revenue by source</h3>
          <p>Parking vs charging; by lot, by period.</p>
        </div>
        <div className="card">
          <h3>Trends & charts</h3>
          <p>Daily, weekly, monthly; YoY comparison.</p>
        </div>
        <div className="card">
          <h3>Export</h3>
          <p>CSV, PDF reports; schedule delivery.</p>
        </div>
      </div>
    </PropertyScreen>
  )
}
