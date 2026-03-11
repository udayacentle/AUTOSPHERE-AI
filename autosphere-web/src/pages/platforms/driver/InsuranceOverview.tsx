import DriverScreen from './DriverScreen'
import { api, type InsurancePolicy } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'

function formatDate(d: string) {
  return d ? new Date(d).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—'
}

export default function InsuranceOverview() {
  const { data: policy, loading, error, refetch } = useApiData<InsurancePolicy | null>(() => api.getInsurance())

  if (loading) {
    return (
      <DriverScreen
        title="Insurance Overview & Premium Calculator"
        subtitle="Policy details and premium estimates"
      >
        <p style={{ color: 'var(--text-secondary)' }}>Loading…</p>
      </DriverScreen>
    )
  }
  if (error) {
    return (
      <DriverScreen
        title="Insurance Overview & Premium Calculator"
        subtitle="Policy details and premium estimates"
      >
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>Refresh</button>
      </DriverScreen>
    )
  }

  return (
    <DriverScreen
      title="Insurance Overview & Premium Calculator"
      subtitle="Policy details and premium estimates"
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>Refresh</button>
      </div>
      <div className="card-grid">
        <div className="card">
          <h3>Current policy</h3>
          <p>
            {policy
              ? `${policy.provider} · ${policy.coverage} · Expires ${formatDate(policy.expiryDate)}`
              : 'No policy on file'}
          </p>
          {policy && (
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Policy # {policy.policyNumber} · ${policy.premium}/yr
            </p>
          )}
        </div>
        <div className="card">
          <h3>Premium calculator</h3>
          <p>Get a quote</p>
        </div>
        <div className="card">
          <h3>Claims</h3>
          <p>File & track</p>
        </div>
      </div>
    </DriverScreen>
  )
}
