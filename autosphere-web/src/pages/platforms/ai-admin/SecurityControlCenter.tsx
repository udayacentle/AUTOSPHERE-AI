import AIAdminScreen from './AIAdminScreen'

export default function SecurityControlCenter() {
  return (
    <AIAdminScreen
      title="Security Control Center"
      subtitle="Security settings and threat overview"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Security settings</h3>
          <p>MFA, IP allowlist, session timeout, password policy.</p>
        </div>
        <div className="card">
          <h3>Threat detection</h3>
          <p>Failed logins, anomaly, suspicious API usage.</p>
        </div>
        <div className="card">
          <h3>Secrets & keys</h3>
          <p>Rotate API keys; manage secrets; vault status.</p>
        </div>
      </div>
    </AIAdminScreen>
  )
}
