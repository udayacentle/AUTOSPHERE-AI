import InsuranceScreen from './InsuranceScreen'
import { api, type InsurancePortfolioData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'

export default function PortfolioOverviewDashboard() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<InsurancePortfolioData>(() =>
    api.getInsurancePortfolio()
  )

  if (loading) {
    return (
      <InsuranceScreen title="Portfolio Overview Dashboard" subtitle="High-level view of risk, claims, and premiums">
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </InsuranceScreen>
    )
  }
  if (error) {
    return (
      <InsuranceScreen title="Portfolio Overview Dashboard" subtitle="High-level view of risk, claims, and premiums">
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </InsuranceScreen>
    )
  }

  return (
    <InsuranceScreen title="Portfolio Overview Dashboard" subtitle="Real aggregate data from backend">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
      <div className="card-grid">
        <div className="card">
          <h3>Active policies</h3>
          <p><strong>{data?.activePolicies ?? 0}</strong></p>
        </div>
        <div className="card">
          <h3>Total premium</h3>
          <p><strong>${data?.totalPremium ?? 0}</strong></p>
        </div>
        <div className="card">
          <h3>Risk exposure (avg)</h3>
          <p><strong>{data?.riskExposure ?? 0}</strong> / 100</p>
        </div>
        <div className="card">
          <h3>Open claims</h3>
          <p><strong>{data?.openClaims ?? 0}</strong></p>
        </div>
        <div className="card">
          <h3>Loss ratio</h3>
          <p><strong>{(data?.lossRatio ?? 0) * 100}%</strong></p>
        </div>
      </div>
    </InsuranceScreen>
  )
}
