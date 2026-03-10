import DriverScreen from './DriverScreen'

export default function DrivingReports() {
  return (
    <DriverScreen
      title="Driving Reports (Weekly/Monthly)"
      subtitle="Summaries and trends"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Weekly report</h3>
          <p>Trips, distance, score</p>
        </div>
        <div className="card">
          <h3>Monthly report</h3>
          <p>Trends & comparison</p>
        </div>
        <div className="card">
          <h3>Export</h3>
          <p>PDF / CSV download</p>
        </div>
      </div>
    </DriverScreen>
  )
}
