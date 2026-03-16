import InsuranceScreen from './InsuranceScreen'
import { api, type InsuranceClaimItem } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'

export default function ClaimsManagementDashboard() {
  const { t } = useI18n()
  const { data: claims = [], loading, error, refetch } = useApiData<InsuranceClaimItem[]>(() =>
    api.getInsuranceClaims()
  )

  if (loading) {
    return (
      <InsuranceScreen title="Claims Management Dashboard" subtitle="Claims pipeline, status, and payouts">
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </InsuranceScreen>
    )
  }
  if (error) {
    return (
      <InsuranceScreen title="Claims Management Dashboard" subtitle="Claims pipeline, status, and payouts">
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </InsuranceScreen>
    )
  }

  const openCount = claims.filter((c) => c.status !== 'paid').length
  const paidTotal = claims.filter((c) => c.status === 'paid').reduce((a, c) => a + c.amount, 0)

  return (
    <InsuranceScreen title="Claims Management Dashboard" subtitle="Real claims data from backend">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
      <div className="card-grid">
        <div className="card">
          <h3>Open claims</h3>
          <p><strong>{openCount}</strong></p>
        </div>
        <div className="card">
          <h3>Total paid</h3>
          <p><strong>${paidTotal.toLocaleString()}</strong></p>
        </div>
        <div className="card">
          <h3>Total claims</h3>
          <p><strong>{claims.length}</strong></p>
        </div>
      </div>
      <section className="card" style={{ marginTop: '1rem' }}>
        <h3>Claims list</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {claims.map((c) => (
            <li key={c.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <strong>{c.id}</strong> · {c.date} · ${c.amount} · {c.status}
              {c.description && <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}> · {c.description}</span>}
            </li>
          ))}
        </ul>
        {claims.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No claims.</p>}
      </section>
    </InsuranceScreen>
  )
}
