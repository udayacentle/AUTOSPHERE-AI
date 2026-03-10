const SCREENS = [
  'Insurance Admin Login',
  'Portfolio Overview Dashboard',
  'Real-Time Risk Monitor',
  'Driver Risk Profile View',
  'Dynamic Premium Adjustment Panel',
  'Claims Management Dashboard',
  'AI Fraud Detection Graph View',
  'Risk Heatmaps',
  'Policy Management',
  'Predictive Loss Forecasting',
  'Model Performance Monitoring',
  'Compliance Reporting',
  'API Integration Settings',
]

export default function Insurance() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Insurance Dashboard</h1>
        <p>Insurance admin screens — risk, claims, premiums, compliance.</p>
      </div>
      <ul className="screen-list">
        {SCREENS.map((name) => (
          <li key={name}><a href="#">{name}</a></li>
        ))}
      </ul>
    </div>
  )
}
