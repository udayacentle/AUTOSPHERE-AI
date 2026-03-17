import { Link } from 'react-router-dom'
import InsuranceScreen from './InsuranceScreen'
import { api, type InsuranceFraudDetectionData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_FRAUD_DETECTION } from './insuranceFallbackData'
import './AIFraudDetectionGraphView.css'

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString(undefined, { dateStyle: 'short' })
  } catch {
    return d
  }
}

function formatFlag(flag: string): string {
  return flag.replace(/_/g, ' ')
}

export default function AIFraudDetectionGraphView() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<InsuranceFraudDetectionData>(() =>
    api.getInsuranceFraudDetection()
  )

  const displayData = (data != null && typeof data === 'object') ? data : (error ? FALLBACK_FRAUD_DETECTION : null)

  if (loading && !displayData) {
    return (
      <InsuranceScreen
        title={t('aiFraudDetection.title')}
        subtitle={t('aiFraudDetection.subtitle')}
      >
        <p className="fraud-view-loading">{t('common.loading')}</p>
      </InsuranceScreen>
    )
  }

  if (!displayData) {
    return (
      <InsuranceScreen
        title={t('aiFraudDetection.title')}
        subtitle={t('aiFraudDetection.subtitle')}
      >
        <div className="fraud-view-error">
          <p>{t('aiFraudDetection.loadFailed')}</p>
          <button type="button" className="fraud-view-btn" onClick={() => refetch()}>
            {t('common.refresh')}
          </button>
        </div>
      </InsuranceScreen>
    )
  }

  const isLive = !error && displayData?.dataSource === 'live'
  const summary = displayData?.summary
  const riskFlags = displayData?.riskFlags ?? []
  const queue = displayData?.investigationQueue ?? []
  const graph = displayData?.graph ?? { nodes: [], edges: [] }

  return (
    <InsuranceScreen
      title={t('aiFraudDetection.title')}
      subtitle={t('aiFraudDetection.subtitle')}
    >
      <div className="fraud-view-page">
        <div className="fraud-view-toolbar">
          <div className="fraud-view-toolbar-left">
            <span className={`fraud-view-badge ${isLive ? 'fraud-view-badge-live' : 'fraud-view-badge-sample'}`}>
              {isLive ? t('aiFraudDetection.dataSourceLive') : t('aiFraudDetection.dataSourceSample')}
            </span>
            {displayData?.lastUpdated && (
              <span className="fraud-view-last-updated">
                {t('aiFraudDetection.lastUpdated')}: {formatDate(displayData.lastUpdated)}
              </span>
            )}
          </div>
          <button type="button" className="fraud-view-btn" onClick={() => refetch()}>
            {t('aiFraudDetection.refresh')}
          </button>
        </div>

        {error && (
          <div className="fraud-view-sample-banner">
            <span>{t('common.sampleDataBanner')}</span>
            <button type="button" className="fraud-view-btn" onClick={() => refetch()}>
              {t('common.refresh')}
            </button>
          </div>
        )}

        <nav className="fraud-view-quick-actions">
          <Link to="portfolio-overview-dashboard" className="fraud-view-quick-link">{t('aiFraudDetection.viewPortfolio')}</Link>
          <Link to="claims-management-dashboard" className="fraud-view-quick-link">{t('aiFraudDetection.viewClaims')}</Link>
          <Link to="real-time-risk-monitor" className="fraud-view-quick-link">{t('aiFraudDetection.viewRiskMonitor')}</Link>
        </nav>

        {summary && (
          <div className="fraud-view-kpis">
            <div className="fraud-view-kpi-card">
              <h3>{t('aiFraudDetection.totalAnalyzed')}</h3>
              <p className="fraud-view-kpi-value">{summary.totalClaimsAnalyzed}</p>
            </div>
            <div className="fraud-view-kpi-card fraud-view-kpi-high">
              <h3>{t('aiFraudDetection.highRiskCount')}</h3>
              <p className="fraud-view-kpi-value">{summary.highRiskCount}</p>
            </div>
            <div className="fraud-view-kpi-card">
              <h3>{t('aiFraudDetection.inInvestigation')}</h3>
              <p className="fraud-view-kpi-value">{summary.inInvestigationCount}</p>
            </div>
          </div>
        )}

        <section className="fraud-view-section">
          <h3 className="fraud-view-section-title">{t('aiFraudDetection.fraudGraph')}</h3>
          <p className="fraud-view-section-desc">{t('aiFraudDetection.entitiesAndLinks')}</p>
          <div className="fraud-view-graph-wrap">
            <div className="fraud-view-edges-table-wrap">
              <table className="fraud-view-table">
                <thead>
                  <tr>
                    <th>{t('aiFraudDetection.from')}</th>
                    <th>{t('aiFraudDetection.to')}</th>
                    <th>{t('aiFraudDetection.linkType')}</th>
                  </tr>
                </thead>
                <tbody>
                  {graph.edges.map((e, i) => {
                    const fromNode = graph.nodes.find((n) => n.id === e.from)
                    const toNode = graph.nodes.find((n) => n.id === e.to)
                    return (
                      <tr key={i}>
                        <td>
                          <span className={`fraud-view-node fraud-view-node-${fromNode?.type || 'driver'}`}>
                            {fromNode?.label ?? e.from}
                          </span>
                        </td>
                        <td>
                          <span className={`fraud-view-node fraud-view-node-${toNode?.type || 'claim'}`}>
                            {toNode?.label ?? e.to}
                          </span>
                        </td>
                        <td>{e.type}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {graph.edges.length === 0 && (
              <p className="fraud-view-empty">No links in graph.</p>
            )}
          </div>
        </section>

        <section className="fraud-view-section">
          <h3 className="fraud-view-section-title">{t('aiFraudDetection.riskFlags')}</h3>
          <div className="fraud-view-table-wrap">
            <table className="fraud-view-table">
              <thead>
                <tr>
                  <th>{t('aiFraudDetection.claimId')}</th>
                  <th>{t('aiFraudDetection.driver')}</th>
                  <th>{t('aiFraudDetection.fraudScore')}</th>
                  <th>{t('aiFraudDetection.flags')}</th>
                  <th>{t('aiFraudDetection.amount')}</th>
                  <th>{t('aiFraudDetection.date')}</th>
                </tr>
              </thead>
              <tbody>
                {riskFlags.map((r) => (
                  <tr key={r.claimId}>
                    <td className="fraud-view-id">{r.claimId}</td>
                    <td>{r.driverName}</td>
                    <td>
                      <span className={`fraud-view-score fraud-view-score-${r.fraudScore >= 40 ? 'high' : r.fraudScore >= 25 ? 'medium' : 'low'}`}>
                        {r.fraudScore}
                      </span>
                    </td>
                    <td>
                      <span className="fraud-view-flags">
                        {r.flags.map((f) => (
                          <span key={f} className="fraud-view-flag-tag">{formatFlag(f)}</span>
                        ))}
                      </span>
                    </td>
                    <td>${r.amount.toLocaleString()}</td>
                    <td>{formatDate(r.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {riskFlags.length === 0 && (
            <p className="fraud-view-empty">No risk flags.</p>
          )}
        </section>

        <section className="fraud-view-section">
          <h3 className="fraud-view-section-title">{t('aiFraudDetection.investigationQueue')}</h3>
          <div className="fraud-view-table-wrap">
            <table className="fraud-view-table">
              <thead>
                <tr>
                  <th>{t('aiFraudDetection.claimId')}</th>
                  <th>{t('aiFraudDetection.driver')}</th>
                  <th>{t('aiFraudDetection.priority')}</th>
                  <th>{t('aiFraudDetection.fraudScore')}</th>
                  <th>{t('aiFraudDetection.reason')}</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((q) => (
                  <tr key={q.claimId}>
                    <td className="fraud-view-id">{q.claimId}</td>
                    <td>{q.driverName}</td>
                    <td>
                      <span className={`fraud-view-priority priority-${q.priority}`}>
                        {t(`aiFraudDetection.${q.priority}`)}
                      </span>
                    </td>
                    <td>{q.fraudScore}</td>
                    <td className="fraud-view-reason">{q.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {queue.length === 0 && (
            <p className="fraud-view-empty">No items in investigation queue.</p>
          )}
        </section>
      </div>
    </InsuranceScreen>
  )
}
