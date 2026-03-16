import InsuranceScreen from './InsuranceScreen'
import { api, type InsuranceDriverRiskItem } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'

export default function DriverRiskProfileView() {
  const { t } = useI18n()
  const { data: drivers = [], loading, error, refetch } = useApiData<InsuranceDriverRiskItem[]>(() =>
    api.getInsuranceDriversRisk()
  )

  if (loading) {
    return (
      <InsuranceScreen title="Driver Risk Profile View" subtitle="Per-driver risk score and behavior insights">
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </InsuranceScreen>
    )
  }
  if (error) {
    return (
      <InsuranceScreen title="Driver Risk Profile View" subtitle="Per-driver risk score and behavior insights">
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </InsuranceScreen>
    )
  }

  return (
    <InsuranceScreen title="Driver Risk Profile View" subtitle="Risk from mobility scores (backend)">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
      <div className="card-grid">
        {drivers.map((d) => (
          <div key={d.driverId} className="card">
            <h3>{d.name}</h3>
            <p>Risk score: <strong>{d.riskScore}</strong> / 100</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Mobility score: {d.mobilityScore}</p>
          </div>
        ))}
      </div>
      {drivers.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No driver risk data.</p>}
    </InsuranceScreen>
  )
}
