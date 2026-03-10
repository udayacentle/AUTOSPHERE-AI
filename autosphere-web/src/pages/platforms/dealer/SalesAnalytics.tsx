import DealerScreen from './DealerScreen'

export default function SalesAnalytics() {
  return (
    <DealerScreen
      title="Sales Analytics"
      subtitle="Sales performance and trends"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Volume & revenue</h3>
          <p>Units sold, revenue, by period, make, model.</p>
        </div>
        <div className="card">
          <h3>By salesperson</h3>
          <p>Individual and team performance.</p>
        </div>
        <div className="card">
          <h3>Charts & export</h3>
          <p>Trends, comparisons, export to CSV/PDF.</p>
        </div>
      </div>
    </DealerScreen>
  )
}
