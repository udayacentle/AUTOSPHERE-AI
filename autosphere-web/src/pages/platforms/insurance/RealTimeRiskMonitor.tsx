import InsuranceScreen from './InsuranceScreen'
import { api, type InsurancePortfolioData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'

export default function RealTimeRiskMonitor() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<InsurancePortfolioData>(() =>
    api.getInsurancePortfolio()
  )

  if (loading) {
    return (
      <InsuranceScreen title="Real-Time Risk Monitor" subtitle="Live risk indicators and alerts">
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </InsuranceScreen>
    )
  }
  if (error) {
    return (
      <InsuranceScreen title="Real-Time Risk Monitor" subtitle="Live risk indicators and alerts">
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </InsuranceScreen>
    )
  }

  const risk = data?.riskExposure ?? 0
  const level = risk >= 70 ? 'High' : risk >= 40 ? 'Medium' : 'Low'

  return (
    <InsuranceScreen title="Real-Time Risk Monitor" subtitle="Portfolio risk from backend">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
      <div className="card-grid">
        <div className="card">
          <h3>Aggregate risk exposure</h3>
          <p><strong>{risk}</strong> / 100</p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Level: {level}</p>
        </div>
        <div className="card">
          <h3>Open claims</h3>
          <p><strong>{data?.openClaims ?? 0}</strong></p>
        </div>
        <div className="card">
          <h3>Loss ratio</h3>
          <p><strong>{((data?.lossRatio ?? 0) * 100).toFixed(1)}%</strong></p>
        </div>
      </div>
    </InsuranceScreen>
  )
}
