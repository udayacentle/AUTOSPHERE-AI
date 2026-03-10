const SCREENS = [
  'Sales Dashboard',
  'Lead Assignment & Scoring',
  'Customer Interaction Logs',
  'Performance Metrics',
  'Commission Tracker',
  'AI Sales Suggestions',
  'Follow-Up Scheduler',
  'Target Achievement Tracker',
]

export default function Sales() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Sales Personnel</h1>
        <p>Sales team screens — leads, performance, commissions, AI suggestions.</p>
      </div>
      <ul className="screen-list">
        {SCREENS.map((name) => (
          <li key={name}><a href="#">{name}</a></li>
        ))}
      </ul>
    </div>
  )
}
