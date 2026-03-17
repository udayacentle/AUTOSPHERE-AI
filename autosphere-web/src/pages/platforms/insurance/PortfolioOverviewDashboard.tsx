import { Link } from 'react-router-dom'
import InsuranceScreen from './InsuranceScreen'
import { api, type InsurancePortfolioData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_PORTFOLIO } from './insuranceFallbackData'
import './PortfolioOverviewDashboard.css'

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString(undefined, { dateStyle: 'short' })
  } catch {
    return d
  }
}

export default function PortfolioOverviewDashboard() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<InsurancePortfolioData>(() =>
    api.getInsurancePortfolio()
  )

  const displayData = (data != null && typeof data === 'object') ? data : (error ? FALLBACK_PORTFOLIO : null)

  if (loading && !displayData) {
    return (
      <InsuranceScreen
        title={t('portfolioOverview.title')}
        subtitle={t('portfolioOverview.subtitle')}
      >
        <p className="portfolio-overview-loading">{t('common.loading')}</p>
      </InsuranceScreen>
    )
  }

  if (!displayData) {
    return (
      <InsuranceScreen
        title={t('portfolioOverview.title')}
        subtitle={t('portfolioOverview.subtitle')}
      >
        <div className="portfolio-overview-error">
          <p>{t('portfolioOverview.loadFailed')}</p>
          <button type="button" className="portfolio-overview-btn" onClick={() => refetch()}>
            {t('common.refresh')}
          </button>
        </div>
      </InsuranceScreen>
    )
  }

  const coverage = displayData?.premiumByCoverage ?? []
  const trend = displayData?.premiumTrend ?? []
  const topRisks = displayData?.topRisks ?? []
  const recentClaims = displayData?.recentClaims ?? []
  const expiringSoon = displayData?.policiesExpiringSoon ?? []
  const maxTrend = Math.max(...trend.map((x) => x.premium), 1)
  const isLive = !error && displayData?.dataSource === 'live'

  return (
    <InsuranceScreen
      title={t('portfolioOverview.title')}
      subtitle={t('portfolioOverview.subtitle')}
    >
      <div className="portfolio-overview-page">
        <div className="portfolio-overview-toolbar">
          <div className="portfolio-overview-toolbar-left">
            <span className={`portfolio-overview-badge ${isLive ? 'portfolio-overview-badge-live' : 'portfolio-overview-badge-sample'}`}>
              {isLive ? t('portfolioOverview.dataSourceLive') : t('portfolioOverview.dataSourceSample')}
            </span>
            {displayData?.lastUpdated && (
              <span className="portfolio-overview-last-updated">
                {t('portfolioOverview.lastUpdated')}: {formatDate(displayData.lastUpdated)}
              </span>
            )}
          </div>
          <button type="button" className="portfolio-overview-btn" onClick={() => refetch()}>
            {t('common.refresh')}
          </button>
        </div>

        {error && (
          <div className="portfolio-overview-sample-banner">
            <span>{t('common.sampleDataBanner')}</span>
            <button type="button" className="portfolio-overview-btn" onClick={() => refetch()}>
              {t('common.refresh')}
            </button>
          </div>
        )}

        <nav className="portfolio-overview-quick-actions">
          <span className="portfolio-overview-quick-label">{t('portfolioOverview.quickActions')}:</span>
          <Link to="policy-management" className="portfolio-overview-quick-link">{t('portfolioOverview.viewPolicies')}</Link>
          <Link to="claims-management-dashboard" className="portfolio-overview-quick-link">{t('portfolioOverview.viewClaims')}</Link>
          <Link to="real-time-risk-monitor" className="portfolio-overview-quick-link">{t('portfolioOverview.viewRiskMonitor')}</Link>
        </nav>

        <div className="portfolio-overview-kpis">
          <div className="portfolio-kpi-card">
            <h3>{t('portfolioOverview.activePolicies')}</h3>
            <p className="portfolio-kpi-value">{displayData?.activePolicies ?? 0}</p>
          </div>
          <div className="portfolio-kpi-card">
            <h3>{t('portfolioOverview.totalPremium')}</h3>
            <p className="portfolio-kpi-value">${(displayData?.totalPremium ?? 0).toLocaleString()}</p>
          </div>
          <div className="portfolio-kpi-card">
            <h3>{t('portfolioOverview.riskExposure')}</h3>
            <p className="portfolio-kpi-value">{displayData?.riskExposure ?? 0} / 100</p>
          </div>
          <div className="portfolio-kpi-card">
            <h3>{t('portfolioOverview.openClaims')}</h3>
            <p className="portfolio-kpi-value">{displayData?.openClaims ?? 0}</p>
          </div>
          <div className="portfolio-kpi-card">
            <h3>{t('portfolioOverview.lossRatio')}</h3>
            <p className="portfolio-kpi-value">{((displayData?.lossRatio ?? 0) * 100).toFixed(1)}%</p>
          </div>
        </div>

        <div className="portfolio-overview-grid">
          {coverage.length > 0 && (
            <section className="portfolio-overview-section">
              <h3>{t('portfolioOverview.premiumByCoverage')}</h3>
              <div className="portfolio-coverage-list">
                {coverage.map((item) => (
                  <div key={item.coverage} className="portfolio-coverage-row">
                    <span className="portfolio-coverage-name">{item.coverage}</span>
                    <span className="portfolio-coverage-meta">
                      {item.count} {t('portfolioOverview.policies')} · ${item.premium.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {trend.length > 0 && (
            <section className="portfolio-overview-section">
              <h3>{t('portfolioOverview.premiumTrend')}</h3>
              <div className="portfolio-trend-bars">
                {trend.map((item) => (
                  <div key={item.month} className="portfolio-trend-item">
                    <span className="portfolio-trend-month">{item.month}</span>
                    <div className="portfolio-trend-bar-wrap">
                      <div
                        className="portfolio-trend-bar"
                        style={{ width: `${(item.premium / maxTrend) * 100}%` }}
                      />
                    </div>
                    <span className="portfolio-trend-value">${item.premium.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {topRisks.length > 0 && (
            <section className="portfolio-overview-section">
              <h3>{t('portfolioOverview.topRisks')}</h3>
              <div className="portfolio-table-wrap">
                <table className="portfolio-table">
                  <thead>
                    <tr>
                      <th>{t('portfolioOverview.driver')}</th>
                      <th>{t('portfolioOverview.riskScore')}</th>
                      <th>{t('portfolioOverview.mobilityScore')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topRisks.map((r) => (
                      <tr key={r.driverId}>
                        <td>{r.name}</td>
                        <td>
                          <span className={r.riskScore > 25 ? 'portfolio-risk-high' : 'portfolio-risk-ok'}>
                            {r.riskScore}
                          </span>
                        </td>
                        <td>{r.mobilityScore}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {recentClaims.length > 0 && (
            <section className="portfolio-overview-section">
              <h3>{t('portfolioOverview.recentClaims')}</h3>
              <div className="portfolio-table-wrap">
                <table className="portfolio-table">
                  <thead>
                    <tr>
                      <th>{t('portfolioOverview.claimId')}</th>
                      <th>{t('portfolioOverview.date')}</th>
                      <th>{t('portfolioOverview.amount')}</th>
                      <th>{t('portfolioOverview.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentClaims.map((c) => (
                      <tr key={c.id}>
                        <td>{c.id}</td>
                        <td>{formatDate(c.date)}</td>
                        <td>${c.amount.toLocaleString()}</td>
                        <td>
                          <span className={`portfolio-claim-status status-${(c.status || '').toLowerCase()}`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {expiringSoon.length > 0 && (
            <section className="portfolio-overview-section">
              <h3>{t('portfolioOverview.policiesExpiringSoon')}</h3>
              <div className="portfolio-table-wrap">
                <table className="portfolio-table">
                  <thead>
                    <tr>
                      <th>{t('portfolioOverview.provider')}</th>
                      <th>Policy #</th>
                      <th>{t('portfolioOverview.expiryDate')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expiringSoon.map((p) => (
                      <tr key={`${p.driverId}-${p.policyNumber}`}>
                        <td>{p.provider}</td>
                        <td>{p.policyNumber}</td>
                        <td>{formatDate(p.expiryDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </div>
    </InsuranceScreen>
  )
}
