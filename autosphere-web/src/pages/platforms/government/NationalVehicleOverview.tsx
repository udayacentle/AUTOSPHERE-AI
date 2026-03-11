import GovernmentScreen from './GovernmentScreen'

export default function NationalVehicleOverview() {
  return (
    <GovernmentScreen
      title="National Vehicle Overview"
      subtitle="Aggregate vehicle and fleet data at national level"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Fleet summary</h3>
          <p>Registered vehicles, by type, fuel, age, region.</p>
        </div>
        <div className="card">
          <h3>Trends</h3>
          <p>Growth, EV adoption, scrappage, new registrations.</p>
        </div>
        <div className="card">
          <h3>Maps & filters</h3>
          <p>Regional drill-down, time range, segment.</p>
        </div>
      </div>
    </GovernmentScreen>
  )
}
