const SCREENS = [
  'Technician Login',
  'Job Queue Dashboard',
  'Vehicle Diagnostic Digital Twin',
  'AI Fault Detection',
  'Repair Recommendations',
  'Parts Prediction Engine',
  'Repair Workflow Tracker',
  'AR Assistance View',
  'Repair Time Estimator',
  'Technician Performance Score',
  'Earnings Summary',
]

export default function Technician() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Technician Platform</h1>
        <p>Technician screens — jobs, diagnostics, repairs, AR, earnings.</p>
      </div>
      <ul className="screen-list">
        {SCREENS.map((name) => (
          <li key={name}><a href="#">{name}</a></li>
        ))}
      </ul>
    </div>
  )
}
