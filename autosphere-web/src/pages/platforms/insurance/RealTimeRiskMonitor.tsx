import { useState } from 'react'
import { Link } from 'react-router-dom'
import InsuranceScreen from './InsuranceScreen'
import { api, type InsuranceRealTimeRiskData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_REAL_TIME_RISK } from './insuranceFallbackData'
import './RealTimeRiskMonitor.css'

const AUTO_REFRESH_MS = 30000

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString(undefined, { dateStyle: 'short' })
  } catch {
    return d
  }
}

function getRiskLevelLabel(level: string, t: (k: string) => string): string {
  if (level === 'high') return t('realTimeRisk.high')
  if (level === 'medium') return t('realTimeRisk.medium')
  return t('realTimeRisk.low')
}

export default function RealTimeRiskMonitor() {
  const { t } = useI18n()
  const [autoRefresh, setAutoRefresh] = useState(false)
  const { data, loading, error, refetch } = useApiData<InsuranceRealTimeRiskData>(
    () => api.getInsuranceRealTimeRisk(),
    { pollInterval: autoRefresh ? AUTO_REFRESH_MS : 0, refetchOnFocus: true }
  )

  const displayData = (data != null && typeof data === 'object') ? data : (error ? FALLBACK_REAL_TIME_RISK : null)

  if (loading && !displayData) {
    return (
      <InsuranceScreen
        title={t('realTimeRisk.title')}
        subtitle={t('realTimeRisk.subtitle')}
      >
        <p className="real-time-risk-loading">{t('common.loading')}</p>
      </InsuranceScreen>
    )
  }

  if (!displayData) {
    return (
      <InsuranceScreen
        title={t('realTimeRisk.title')}
        subtitle={t('realTimeRisk.subtitle')}
      >
        <div className="real-time-risk-error">
          <p>{t('realTimeRisk.loadFailed')}</p>
          <button type="button" className="real-time-risk-btn" onClick={() => refetch()}>
            {t('common.refresh')}
          </button>
        </div>
      </InsuranceScreen>
    )
  }

  const level = displayData?.riskLevel || 'low'
  const alerts = displayData?.alerts ?? []
  const openClaimsList = displayData?.openClaimsList ?? []
  const driversRisk = displayData?.driversRisk ?? []
  const summary = displayData?.summary
  const isLive = !error && displayData?.dataSource === 'live'
  const riskPct = Math.min(100, Math.max(0, displayData?.riskExposure ?? 0))

  const summaryText = summary
    ? t('realTimeRisk.summaryLine')
        .replace('{{drivers}}', String(summary?.totalDrivers ?? 0))
        .replace('{{open}}', String(summary?.totalOpenClaims ?? 0))
        .replace('{{high}}', String(summary?.highRiskCount ?? 0))
    : null

  return (
    <InsuranceScreen
      title={t('realTimeRisk.title')}
      subtitle={t('realTimeRisk.subtitle')}
    >
      <div className="real-time-risk-page">
        <div className="real-time-risk-toolbar">
          <div className="real-time-risk-toolbar-left">
            <span className={`real-time-risk-badge ${isLive ? 'real-time-risk-badge-live' : 'real-time-risk-badge-sample'}`}>
              {isLive ? t('realTimeRisk.dataSourceLive') : t('realTimeRisk.dataSourceSample')}
            </span>
            {displayData?.lastUpdated && (
              <span className="real-time-risk-last-updated">
                {t('realTimeRisk.lastUpdated')}: {formatDate(displayData.lastUpdated)}
              </span>
            )}
            {summaryText && (
              <span className="real-time-risk-summary">{summaryText}</span>
            )}
          </div>
          <div className="real-time-risk-toolbar-actions">
            <label className="real-time-risk-auto-refresh">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              {t('realTimeRisk.autoRefresh')}
            </label>
            <button type="button" className="real-time-risk-btn" onClick={() => refetch()}>
              {t('realTimeRisk.refresh')}
            </button>
          </div>
        </div>

        {error && (
          <div className="real-time-risk-sample-banner">
            <span>{t('common.sampleDataBanner')}</span>
            <button type="button" className="real-time-risk-btn" onClick={() => refetch()}>
              {t('common.refresh')}
            </button>
          </div>
        )}

        <nav className="real-time-risk-quick-actions">
          <Link to="portfolio-overview-dashboard" className="real-time-risk-quick-link">{t('realTimeRisk.viewPortfolio')}</Link>
          <Link to="claims-management-dashboard" className="real-time-risk-quick-link">{t('realTimeRisk.viewClaims')}</Link>
          <Link to="policy-management" className="real-time-risk-quick-link">{t('realTimeRisk.viewPolicies')}</Link>
        </nav>

        <div className="real-time-risk-kpis">
          <div className={`real-time-risk-gauge risk-${level}`}>
            <h3>{t('realTimeRisk.aggregateRisk')}</h3>
            <div className="real-time-risk-bar-wrap">
              <div className="real-time-risk-bar" style={{ width: `${riskPct}%` }} />
            </div>
            <p className="real-time-risk-value">{displayData.riskExposure ?? 0} / 100</p>
            <p className="real-time-risk-level">
              {t('realTimeRisk.riskLevel')}: {getRiskLevelLabel(level, t)}
            </p>
          </div>
          <div className="real-time-risk-kpi-card">
            <h3>{t('realTimeRisk.openClaims')}</h3>
            <p className="real-time-risk-kpi-value">{displayData?.openClaims ?? 0}</p>
          </div>
          <div className="real-time-risk-kpi-card">
            <h3>{t('realTimeRisk.lossRatio')}</h3>
            <p className="real-time-risk-kpi-value">
              {((displayData?.lossRatio ?? 0) * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {alerts.length > 0 && (
          <section className="real-time-risk-section">
            <h3>
              {t('realTimeRisk.alertsAndTasks')}
              <span className="real-time-risk-alert-count">{alerts.length}</span>
            </h3>
            <ul className="real-time-risk-alerts">
              {alerts.map((a) => (
                <li
                  key={`${a.type}-${a.id}`}
                  className={`real-time-risk-alert alert-${a.type}`}
                >
                  <span className="real-time-risk-alert-message">{a.message}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {alerts.length === 0 && (
          <section className="real-time-risk-section">
            <h3>{t('realTimeRisk.alertsAndTasks')}</h3>
            <p className="real-time-risk-no-alerts">{t('realTimeRisk.noAlerts')}</p>
          </section>
        )}

        <div className="real-time-risk-grid">
          {openClaimsList.length > 0 && (
            <section className="real-time-risk-section">
              <h3>{t('realTimeRisk.openClaimsList')}</h3>
              <div className="real-time-risk-table-wrap">
                <table className="real-time-risk-table">
                  <thead>
                    <tr>
                      <th>{t('realTimeRisk.claimId')}</th>
                      <th>{t('realTimeRisk.date')}</th>
                      <th>{t('realTimeRisk.amount')}</th>
                      <th>{t('realTimeRisk.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openClaimsList.map((c) => (
                      <tr key={c.id}>
                        <td>{c.id}</td>
                        <td>{formatDate(c.date)}</td>
                        <td>${c.amount.toLocaleString()}</td>
                        <td>
                          <span className={`real-time-risk-status status-${(c.status || '').toLowerCase()}`}>
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

          {driversRisk.length > 0 && (
            <section className="real-time-risk-section">
              <h3>{t('realTimeRisk.highRiskDrivers')}</h3>
              <div className="real-time-risk-table-wrap">
                <table className="real-time-risk-table">
                  <thead>
                    <tr>
                      <th>{t('realTimeRisk.driver')}</th>
                      <th>{t('realTimeRisk.riskScore')}</th>
                      <th>{t('realTimeRisk.mobilityScore')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {driversRisk.map((d) => (
                      <tr key={d.driverId}>
                        <td>{d.name}</td>
                        <td>
                          <span className={d.riskScore >= 25 ? 'real-time-risk-high' : ''}>
                            {d.riskScore}
                          </span>
                        </td>
                        <td>{d.mobilityScore}</td>
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
