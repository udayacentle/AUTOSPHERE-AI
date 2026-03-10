const SCREENS = [
  'Dealer Login & Dashboard',
  'Inventory Management',
  'Add/Edit Vehicle',
  'Digital Twin Inventory View',
  'Dynamic Pricing Engine',
  'Demand Forecast Dashboard',
  'Trade-In Valuation Tool',
  'Lead Management',
  'Customer Profile View',
  'Sales Funnel',
  'Sales Analytics',
  'Commission Management',
  'Finance Integration Panel',
  'Market Trend Insights',
]

export default function Dealer() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Dealer Platform</h1>
        <p>Dealer-facing screens — inventory, leads, pricing, sales.</p>
      </div>
      <ul className="screen-list">
        {SCREENS.map((name) => (
          <li key={name}><a href="#">{name}</a></li>
        ))}
      </ul>
    </div>
  )
}
