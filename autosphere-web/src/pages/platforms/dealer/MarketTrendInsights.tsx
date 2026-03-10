import DealerScreen from './DealerScreen'

export default function MarketTrendInsights() {
  return (
    <DealerScreen
      title="Market Trend Insights"
      subtitle="Market data and competitive intelligence"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Price trends</h3>
          <p>Segment and model-level price movement.</p>
        </div>
        <div className="card">
          <h3>Demand signals</h3>
          <p>Search volume, interest, regional demand.</p>
        </div>
        <div className="card">
          <h3>Competitive view</h3>
          <p>Nearby listings, days on market, pricing comparison.</p>
        </div>
      </div>
    </DealerScreen>
  )
}
