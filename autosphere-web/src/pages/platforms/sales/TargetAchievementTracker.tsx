import SalesScreen from './SalesScreen'

export default function TargetAchievementTracker() {
  return (
    <SalesScreen
      title="Target Achievement Tracker"
      subtitle="Track progress toward sales targets"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Target vs actual</h3>
          <p>Units, revenue, or other KPIs by period.</p>
        </div>
        <div className="card">
          <h3>Progress bar</h3>
          <p>% of target achieved, days left in period.</p>
        </div>
        <div className="card">
          <h3>Gap analysis</h3>
          <p>What’s needed to hit target; forecast at current run rate.</p>
        </div>
      </div>
    </SalesScreen>
  )
}
