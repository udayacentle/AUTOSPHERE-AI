import InsuranceScreen from './InsuranceScreen'

export default function APIIntegrationSettings() {
  return (
    <InsuranceScreen
      title="API Integration Settings"
      subtitle="Configure APIs and data connections"
    >
      <div className="card-grid">
        <div className="card">
          <h3>API keys & endpoints</h3>
          <p>AutoSphere, telematics, and third-party APIs.</p>
        </div>
        <div className="card">
          <h3>Webhooks</h3>
          <p>Events for risk, claims, and policy updates.</p>
        </div>
        <div className="card">
          <h3>Rate limits & usage</h3>
          <p>Quotas and consumption by product.</p>
        </div>
      </div>
    </InsuranceScreen>
  )
}
