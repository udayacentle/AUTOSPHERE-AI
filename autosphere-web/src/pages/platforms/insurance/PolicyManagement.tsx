import InsuranceScreen from './InsuranceScreen'
import { api, type InsurancePolicyListItem } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'

export default function PolicyManagement() {
  const { t } = useI18n()
  const { data: policies = [], loading, error, refetch } = useApiData<InsurancePolicyListItem[]>(() =>
    api.getInsurancePolicies()
  )

  if (loading) {
    return (
      <InsuranceScreen title="Policy Management" subtitle="Create, renew, and manage policies">
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </InsuranceScreen>
    )
  }
  if (error) {
    return (
      <InsuranceScreen title="Policy Management" subtitle="Create, renew, and manage policies">
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </InsuranceScreen>
    )
  }

  return (
    <InsuranceScreen title="Policy Management" subtitle="Real policies from backend">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
      <div className="card-grid">
        <div className="card">
          <h3>Active policies</h3>
          <p><strong>{policies.length}</strong></p>
        </div>
        <div className="card">
          <h3>Total premium</h3>
          <p><strong>${policies.reduce((a, p) => a + p.premium, 0).toLocaleString()}</strong></p>
        </div>
      </div>
      <section className="card" style={{ marginTop: '1rem' }}>
        <h3>Policy list</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {policies.map((p, i) => (
            <li key={p.driverId + i} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <strong>{p.provider}</strong> · {p.policyNumber} · Expires {p.expiryDate} · ${p.premium} · {p.coverage}
            </li>
          ))}
        </ul>
        {policies.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No policies.</p>}
      </section>
    </InsuranceScreen>
  )
}
