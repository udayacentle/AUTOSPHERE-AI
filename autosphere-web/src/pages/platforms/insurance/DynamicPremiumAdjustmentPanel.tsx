import InsuranceScreen from './InsuranceScreen'

export default function DynamicPremiumAdjustmentPanel() {
  return (
    <InsuranceScreen
      title="Dynamic Premium Adjustment Panel"
      subtitle="Adjust premiums by risk, segment, and rules"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Premium rules</h3>
          <p>Risk bands, discounts, surcharges.</p>
        </div>
        <div className="card">
          <h3>Segment pricing</h3>
          <p>By vehicle type, region, driver tier.</p>
        </div>
        <div className="card">
          <h3>Simulation</h3>
          <p>What-if impact on portfolio and loss ratio.</p>
        </div>
      </div>
    </InsuranceScreen>
  )
}
