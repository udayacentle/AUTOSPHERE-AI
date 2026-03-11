import GovernmentScreen from './GovernmentScreen'

export default function ExportReportingTools() {
  return (
    <GovernmentScreen
      title="Export & Reporting Tools"
      subtitle="Export data and generate regulatory reports"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Export formats</h3>
          <p>CSV, Excel, PDF; filtered by date, region, metric.</p>
        </div>
        <div className="card">
          <h3>Regulatory templates</h3>
          <p>Pre-defined report templates for statutory filing.</p>
        </div>
        <div className="card">
          <h3>API & audit</h3>
          <p>API access for external systems; export audit log.</p>
        </div>
      </div>
    </GovernmentScreen>
  )
}
