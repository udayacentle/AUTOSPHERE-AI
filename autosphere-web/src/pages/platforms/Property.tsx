const SCREENS = [
  'Property Admin Login',
  'Property Dashboard',
  'Parking Utilization Heatmap',
  'Slot Management',
  'Dynamic Pricing Engine',
  'EV Charging Control Panel',
  'Load Balancing Monitor',
  'Revenue Analytics Dashboard',
  'Peak Traffic Prediction',
  'Access Control Management',
  'Carbon Impact Dashboard',
]

export default function Property() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Property Owner</h1>
        <p>Property admin — parking, EV charging, revenue, access control.</p>
      </div>
      <ul className="screen-list">
        {SCREENS.map((name) => (
          <li key={name}><a href="#">{name}</a></li>
        ))}
      </ul>
    </div>
  )
}
