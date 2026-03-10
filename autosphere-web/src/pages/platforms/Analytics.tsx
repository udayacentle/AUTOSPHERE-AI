const SCREENS = [
  'Global Performance Dashboard',
  'Mobility Score Distribution',
  'Vehicle Health Trends',
  'Insurance Risk Trends',
  'Dealer Sales Trends',
  'Technician Performance Trends',
  'Parking Revenue Trends',
  'Emission Analytics',
  'Predictive Forecast Charts',
  'AI Model Comparison Dashboard',
]

export default function Analytics() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Cross-Platform Analytics</h1>
        <p>Analytics and trends across all platforms.</p>
      </div>
      <ul className="screen-list">
        {SCREENS.map((name) => (
          <li key={name}><a href="#">{name}</a></li>
        ))}
      </ul>
    </div>
  )
}
