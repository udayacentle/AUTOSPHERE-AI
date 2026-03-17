import { Link } from 'react-router-dom'
import InsuranceScreen from './InsuranceScreen'
import { api, type InsuranceDynamicPremiumData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_DYNAMIC_PREMIUM } from './insuranceFallbackData'
import './DynamicPremiumAdjustmentPanel.css'

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return d
  }
}

export default function DynamicPremiumAdjustmentPanel() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<InsuranceDynamicPremiumData>(() =>
    api.getInsuranceDynamicPremium()
  )

  const displayData = (data != null && typeof data === 'object') ? data : (error ? FALLBACK_DYNAMIC_PREMIUM : null)

  if (loading && !displayData) {
    return (
      <InsuranceScreen
        title={t('dynamicPremium.title')}
        subtitle={t('dynamicPremium.subtitle')}
      >
        <p className="dynamic-premium-loading">{t('common.loading')}</p>
      </InsuranceScreen>
    )
  }

  if (!displayData) {
    return (
      <InsuranceScreen
        title={t('dynamicPremium.title')}
        subtitle={t('dynamicPremium.subtitle')}
      >
        <div className="dynamic-premium-error">
          <p>{t('dynamicPremium.loadFailed')}</p>
          <button type="button" className="dynamic-premium-btn" onClick={() => refetch()}>
            {t('common.refresh')}
          </button>
        </div>
      </InsuranceScreen>
    )
  }

  const isLive = !error && displayData?.dataSource === 'live'
  const rules = displayData?.rules
  const segments = displayData?.segments ?? []
  const summary = displayData?.summary

  return (
    <InsuranceScreen
      title={t('dynamicPremium.title')}
      subtitle={t('dynamicPremium.subtitle')}
    >
      <div className="dynamic-premium-page">
        <div className="dynamic-premium-toolbar">
          <div className="dynamic-premium-toolbar-left">
            <span className={`dynamic-premium-badge ${isLive ? 'dynamic-premium-badge-live' : 'dynamic-premium-badge-sample'}`}>
              {isLive ? t('dynamicPremium.dataSourceLive') : t('dynamicPremium.dataSourceSample')}
            </span>
            {displayData.lastUpdated && (
              <span className="dynamic-premium-last-updated">
                {t('dynamicPremium.lastUpdated')}: {formatDate(displayData.lastUpdated)}
              </span>
            )}
          </div>
          <button type="button" className="dynamic-premium-btn" onClick={() => refetch()}>
            {t('dynamicPremium.refresh')}
          </button>
        </div>

        {error && (
          <div className="dynamic-premium-sample-banner">
            <span>{t('common.sampleDataBanner')}</span>
            <button type="button" className="dynamic-premium-btn" onClick={() => refetch()}>
              {t('common.refresh')}
            </button>
          </div>
        )}

        <nav className="dynamic-premium-quick-actions">
          <Link to="portfolio-overview-dashboard" className="dynamic-premium-quick-link">{t('dynamicPremium.viewPortfolio')}</Link>
          <Link to="real-time-risk-monitor" className="dynamic-premium-quick-link">{t('dynamicPremium.viewRiskMonitor')}</Link>
          <Link to="claims-management-dashboard" className="dynamic-premium-quick-link">{t('dynamicPremium.viewClaims')}</Link>
        </nav>

        <section className="dynamic-premium-section">
          <h3 className="dynamic-premium-section-title">{t('dynamicPremium.premiumRules')}</h3>
          {rules && (
            <>
              <h4 className="dynamic-premium-subtitle">{t('dynamicPremium.riskBands')}</h4>
              <div className="dynamic-premium-table-wrap">
                <table className="dynamic-premium-table">
                  <thead>
                    <tr>
                      <th>{t('dynamicPremium.riskBandScore')}</th>
                      <th>{t('dynamicPremium.segment')}</th>
                      <th>{t('dynamicPremium.surcharge')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.riskBands.map((b, i) => (
                      <tr key={i}>
                        <td>{b.minScore} – {b.maxScore}</td>
                        <td>{b.label}</td>
                        <td>{b.surchargePercent > 0 ? `+${b.surchargePercent}%` : b.surchargePercent}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h4 className="dynamic-premium-subtitle">{t('dynamicPremium.discounts')}</h4>
              <div className="dynamic-premium-table-wrap">
                <table className="dynamic-premium-table">
                  <thead>
                    <tr>
                      <th>{t('dynamicPremium.segment')}</th>
                      <th>{t('dynamicPremium.condition')}</th>
                      <th>{t('dynamicPremium.percent')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.discounts.map((d) => (
                      <tr key={d.id}>
                        <td>{d.name}</td>
                        <td>{d.condition}</td>
                        <td className="dynamic-premium-discount">−{d.percent}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h4 className="dynamic-premium-subtitle">{t('dynamicPremium.surcharges')}</h4>
              <div className="dynamic-premium-table-wrap">
                <table className="dynamic-premium-table">
                  <thead>
                    <tr>
                      <th>{t('dynamicPremium.segment')}</th>
                      <th>{t('dynamicPremium.condition')}</th>
                      <th>{t('dynamicPremium.percent')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.surcharges.map((s) => (
                      <tr key={s.id}>
                        <td>{s.name}</td>
                        <td>{s.condition}</td>
                        <td className="dynamic-premium-surcharge">+{s.percent}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        <section className="dynamic-premium-section">
          <h3 className="dynamic-premium-section-title">{t('dynamicPremium.segmentPricing')}</h3>
          <div className="dynamic-premium-table-wrap">
            <table className="dynamic-premium-table">
              <thead>
                <tr>
                  <th>{t('dynamicPremium.coverage')}</th>
                  <th>{t('dynamicPremium.policyCount')}</th>
                  <th>{t('dynamicPremium.totalPremium')}</th>
                  <th>{t('dynamicPremium.averagePremium')}</th>
                </tr>
              </thead>
              <tbody>
                {segments.map((s, i) => (
                  <tr key={i}>
                    <td>{s.segmentValue}</td>
                    <td>{s.policyCount}</td>
                    <td>${s.totalPremium.toLocaleString()}</td>
                    <td>${s.averagePremium.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {segments.length === 0 && (
            <p className="dynamic-premium-empty">{t('dynamicPremium.segmentPricing')} — no data.</p>
          )}
        </section>

        <section className="dynamic-premium-section">
          <h3 className="dynamic-premium-section-title">{t('dynamicPremium.simulation')}</h3>
          <p className="dynamic-premium-desc">{t('dynamicPremium.simulationDesc')}</p>
          {summary && (
            <div className="dynamic-premium-kpis">
              <div className="dynamic-premium-kpi-card">
                <h4>{t('dynamicPremium.totalPremium')}</h4>
                <p className="dynamic-premium-kpi-value">${summary.totalPremium.toLocaleString()}</p>
              </div>
              <div className="dynamic-premium-kpi-card">
                <h4>{t('dynamicPremium.totalPolicies')}</h4>
                <p className="dynamic-premium-kpi-value">{summary.activePolicies}</p>
              </div>
              <div className="dynamic-premium-kpi-card">
                <h4>{t('dynamicPremium.lossRatio')}</h4>
                <p className="dynamic-premium-kpi-value">{(summary.lossRatio * 100).toFixed(1)}%</p>
              </div>
              <div className="dynamic-premium-kpi-card">
                <h4>{t('dynamicPremium.claimsPaid')}</h4>
                <p className="dynamic-premium-kpi-value">${summary.totalClaimsPaid.toLocaleString()}</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </InsuranceScreen>
  )
}
