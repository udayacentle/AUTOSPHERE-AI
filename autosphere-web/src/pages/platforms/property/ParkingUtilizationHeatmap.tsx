import PropertyScreen from './PropertyScreen'

export default function ParkingUtilizationHeatmap() {
  return (
    <PropertyScreen
      title="Parking Utilization Heatmap"
      subtitle="Visualize occupancy by zone and time"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Zone heatmap</h3>
          <p>Occupancy % by lot, floor, or zone; color-coded.</p>
        </div>
        <div className="card">
          <h3>Time range</h3>
          <p>By hour, day, week; peak periods.</p>
        </div>
        <div className="card">
          <h3>Filters</h3>
          <p>By property, lot type, EV vs standard.</p>
        </div>
      </div>
    </PropertyScreen>
  )
}
