import SalesScreen from './SalesScreen'

export default function SalesDashboard() {
  return (
    <SalesScreen
      title="Sales Dashboard"
      subtitle="Overview for sales personnel — leads, pipeline, and targets"
    >
      <div className="card-grid">
        <div className="card">
          <h3>My leads</h3>
          <p>Assigned leads, hot prospects, follow-ups due.</p>
        </div>
        <div className="card">
          <h3>Pipeline value</h3>
          <p>Deals in progress and expected closure.</p>
        </div>
        <div className="card">
          <h3>Targets</h3>
          <p>Monthly/quarterly targets vs achieved.</p>
        </div>
        <div className="card">
          <h3>Commission summary</h3>
          <p>Earned and pending commission.</p>
        </div>
      </div>
    </SalesScreen>
  )
}
