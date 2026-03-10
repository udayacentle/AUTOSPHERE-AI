const SCREENS = [
  'Regulator Login',
  'National Vehicle Overview',
  'Compliance Monitoring Dashboard',
  'Emission Monitoring Panel',
  'Traffic Density Heatmap',
  'Accident Cluster Prediction',
  'Risk Zone Analytics',
  'Policy Simulation Engine',
  'Recall Monitoring',
  'Fraud Pattern Analytics',
  'Regional Reports',
  'Export & Reporting Tools',
]

export default function Government() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Government Regulatory Console</h1>
        <p>Regulator screens — compliance, emissions, recalls, fraud, reporting.</p>
      </div>
      <ul className="screen-list">
        {SCREENS.map((name) => (
          <li key={name}><a href="#">{name}</a></li>
        ))}
      </ul>
    </div>
  )
}
