import GovernmentScreen from './GovernmentScreen'

export default function TrafficDensityHeatmap() {
  return (
    <GovernmentScreen
      title="Traffic Density Heatmap"
      subtitle="Visualize traffic and congestion by area and time"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Density map</h3>
          <p>Traffic volume, speed, congestion by road/zone.</p>
        </div>
        <div className="card">
          <h3>Time range</h3>
          <p>By hour, day, event; peak and off-peak.</p>
        </div>
        <div className="card">
          <h3>Overlays</h3>
          <p>Accidents, incidents, roadworks, air quality.</p>
        </div>
      </div>
    </GovernmentScreen>
  )
}
