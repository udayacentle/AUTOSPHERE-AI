import AnalyticsScreen from './AnalyticsScreen'

export default function DealerSalesTrends() {
  return (
    <AnalyticsScreen
      title="Dealer Sales Trends"
      subtitle="Sales volume and revenue trends across dealers"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Sales metrics</h3>
          <p>Units sold, revenue, conversion rate, pipeline value.</p>
        </div>
        <div className="card">
          <h3>By dealer / region</h3>
          <p>Compare dealers; regional performance.</p>
        </div>
        <div className="card">
          <h3>Trends</h3>
          <p>Sales over time; seasonality; YoY comparison.</p>
        </div>
      </div>
    </AnalyticsScreen>
  )
}
