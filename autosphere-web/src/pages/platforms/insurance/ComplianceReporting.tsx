import InsuranceScreen from './InsuranceScreen'

export default function ComplianceReporting() {
  return (
    <InsuranceScreen
      title="Compliance Reporting"
      subtitle="Regulatory and internal compliance reports"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Regulatory reports</h3>
          <p>Required filings by jurisdiction and date.</p>
        </div>
        <div className="card">
          <h3>Audit trail</h3>
          <p>Changes to policies, premiums, and claims.</p>
        </div>
        <div className="card">
          <h3>Export & schedule</h3>
          <p>Generate and schedule report delivery.</p>
        </div>
      </div>
    </InsuranceScreen>
  )
}
