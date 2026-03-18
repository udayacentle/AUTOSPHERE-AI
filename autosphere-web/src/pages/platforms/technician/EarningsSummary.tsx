import TechnicianScreen from './TechnicianScreen'
import './TechnicianSections.css'
import { api, type TechnicianEarningsData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_EARNINGS } from './technicianFallbacks'

export default function EarningsSummary() {
  const { t } = useI18n()
  const { data: earnings, loading, error, refetch } = useApiData<TechnicianEarningsData | null>(() =>
    api.getTechnicianEarnings()
  )
  const earningsDisplay = earnings ?? (error ? FALLBACK_EARNINGS : null)

  if (loading && !earningsDisplay) {
    return (
      <TechnicianScreen title="Earnings Summary" subtitle="Pay and commission by job and period">
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </TechnicianScreen>
    )
  }

  if (!earningsDisplay) return null

  return (
    <TechnicianScreen title="Earnings Summary" subtitle="Pay and commission by job and period">
      {error && (
        <div className="tech-offline-banner" style={{ marginBottom: '1rem' }}>
          <span>Showing sample data. Start backend in <code>autosphere_full_production_monorepo/services/backend</code> for live data.</span>
          <button type="button" className="btn-refresh" onClick={() => refetch()}>Retry</button>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
      <section className="card">
        <h3>Earnings by period</h3>
        <p>Daily, weekly, monthly; base + incentive.</p>
        <div className="tech-table-wrap">
          <table className="tech-table">
            <thead>
              <tr><th>Period</th><th>Base</th><th>Incentive</th><th>Total</th></tr>
            </thead>
            <tbody>
              {(Array.isArray(earningsDisplay.byPeriod) ? earningsDisplay.byPeriod : []).map((p, i) => (
                <tr key={i}>
                  <td>{p.label}</td>
                  <td>${p.base}</td>
                  <td>${p.incentive}</td>
                  <td><strong>${p.total}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="card">
        <h3>By job type</h3>
        <p>Labour units, flat rate, bonus jobs.</p>
        <div className="tech-table-wrap">
          <table className="tech-table">
            <thead>
              <tr><th>Job type</th><th>Labour units</th><th>Amount</th><th>Count</th></tr>
            </thead>
            <tbody>
              {(Array.isArray(earningsDisplay.byJobType) ? earningsDisplay.byJobType : []).map((j, i) => (
                <tr key={i}>
                  <td>{j.jobType}</td>
                  <td>{j.labourUnits}</td>
                  <td>${j.amount}</td>
                  <td>{j.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="card">
        <h3>Payout history</h3>
        <p>Next pay date: <strong>{earningsDisplay.nextPayDate}</strong>. Pending: <strong>${earningsDisplay.pendingAmount}</strong></p>
        <div className="tech-table-wrap">
          <table className="tech-table">
            <thead>
              <tr><th>Date</th><th>Amount</th><th>Status</th><th>Method</th></tr>
            </thead>
            <tbody>
              {(Array.isArray(earningsDisplay.payouts) ? earningsDisplay.payouts : []).map((p, i) => (
                <tr key={i}>
                  <td>{p.date}</td>
                  <td>${p.amount}</td>
                  <td>{p.status}</td>
                  <td>{p.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </TechnicianScreen>
  )
}
