import AnalyticsScreen from './AnalyticsScreen'

export default function ParkingRevenueTrends() {
  return (
    <AnalyticsScreen
      title="Parking Revenue Trends"
      subtitle="Parking and EV charging revenue across properties"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Revenue metrics</h3>
          <p>Parking revenue, charging revenue, occupancy %, ARPU.</p>
        </div>
        <div className="card">
          <h3>By property / region</h3>
          <p>Compare properties; top revenue locations.</p>
        </div>
        <div className="card">
          <h3>Trends</h3>
          <p>Revenue over time; pricing or demand impact.</p>
        </div>
      </div>
    </AnalyticsScreen>
  )
}
