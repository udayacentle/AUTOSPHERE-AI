import { Link } from 'react-router-dom'
import InsuranceScreen from './InsuranceScreen'
import { api, type InsuranceModelPerformanceData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_MODEL_PERFORMANCE } from './insuranceFallbackData'
import './ModelPerformanceMonitoring.css'

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return d
  }
}

export default function ModelPerformanceMonitoring() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<InsuranceModelPerformanceData>(() =>
    api.getInsuranceModelPerformance()
  )

  const displayData = (data != null && typeof data === 'object') ? data : (error ? FALLBACK_MODEL_PERFORMANCE : null)

  if (loading && !displayData) {
    return (
      <InsuranceScreen
        title={t('modelPerformance.title')}
        subtitle={t('modelPerformance.subtitle')}
      >
        <p className="model-perf-loading">{t('common.loading')}</p>
      </InsuranceScreen>
    )
  }

  if (!displayData) {
    return (
      <InsuranceScreen
        title={t('modelPerformance.title')}
        subtitle={t('modelPerformance.subtitle')}
      >
        <div className="model-perf-error">
          <p>{t('modelPerformance.loadFailed')}</p>
          <button type="button" className="model-perf-btn" onClick={() => refetch()}>
            {t('common.refresh')}
          </button>
        </div>
      </InsuranceScreen>
    )
  }

  const isLive = !error && displayData?.dataSource === 'live'
  const modelMetrics = displayData?.modelMetrics ?? []
  const drift = displayData?.driftDetection
  const versionHistory = displayData?.versionHistory ?? []

  return (
    <InsuranceScreen
      title={t('modelPerformance.title')}
      subtitle={t('modelPerformance.subtitle')}
    >
      <div className="model-perf-page">
        <div className="model-perf-toolbar">
          <div className="model-perf-toolbar-left">
            <span className={`model-perf-badge ${isLive ? 'model-perf-badge-live' : 'model-perf-badge-sample'}`}>
              {isLive ? t('modelPerformance.dataSourceLive') : t('modelPerformance.dataSourceSample')}
            </span>
            {displayData.lastUpdated && (
              <span className="model-perf-last-updated">
                {t('modelPerformance.lastUpdated')}: {formatDate(displayData.lastUpdated)}
              </span>
            )}
          </div>
          <button type="button" className="model-perf-btn" onClick={() => refetch()}>
            {t('modelPerformance.refresh')}
          </button>
        </div>

        {error && (
          <div className="model-perf-sample-banner">
            <span>{t('common.sampleDataBanner')}</span>
            <button type="button" className="model-perf-btn" onClick={() => refetch()}>
              {t('common.refresh')}
            </button>
          </div>
        )}

        <nav className="model-perf-quick-actions">
          <Link to="portfolio-overview-dashboard" className="model-perf-quick-link">{t('modelPerformance.viewPortfolio')}</Link>
          <Link to="claims-management-dashboard" className="model-perf-quick-link">{t('modelPerformance.viewClaims')}</Link>
          <Link to="real-time-risk-monitor" className="model-perf-quick-link">{t('modelPerformance.viewRiskMonitor')}</Link>
        </nav>

        <section className="model-perf-section">
          <h3 className="model-perf-section-title">{t('modelPerformance.modelMetrics')}</h3>
          <p className="model-perf-section-desc">{t('modelPerformance.modelMetricsDesc')}</p>
          <div className="model-perf-table-wrap">
            <table className="model-perf-table">
              <thead>
                <tr>
                  <th>{t('modelPerformance.model')}</th>
                  <th>{t('modelPerformance.accuracy')}</th>
                  <th>{t('modelPerformance.precision')}</th>
                  <th>{t('modelPerformance.recall')}</th>
                  <th>{t('modelPerformance.auc')}</th>
                  <th>{t('modelPerformance.sampleSize')}</th>
                </tr>
              </thead>
              <tbody>
                {modelMetrics.map((m) => (
                  <tr key={m.modelId}>
                    <td><strong>{m.modelName}</strong></td>
                    <td>{(m.accuracy * 100).toFixed(1)}%</td>
                    <td>{(m.precision * 100).toFixed(1)}%</td>
                    <td>{(m.recall * 100).toFixed(1)}%</td>
                    <td>{(m.auc * 100).toFixed(1)}%</td>
                    <td>{m.sampleSize ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {modelMetrics.length === 0 && (
            <p className="model-perf-empty">No model metrics.</p>
          )}
        </section>

        {drift && (
          <section className="model-perf-section">
            <h3 className="model-perf-section-title">{t('modelPerformance.driftDetection')}</h3>
            <p className="model-perf-section-desc">{t('modelPerformance.driftDesc')}</p>
            <div className="model-perf-drift-grid">
              <div className="model-perf-drift-card">
                <h4>{t('modelPerformance.riskInputDrift')}</h4>
                <p className="model-perf-drift-value">{(drift.riskInputDrift * 100).toFixed(2)}%</p>
                <div className="model-perf-drift-bar"><div className="model-perf-drift-fill" style={{ width: `${Math.min(100, drift.riskInputDrift * 500)}%` }} /></div>
              </div>
              <div className="model-perf-drift-card">
                <h4>{t('modelPerformance.riskPredictionDrift')}</h4>
                <p className="model-perf-drift-value">{(drift.riskPredictionDrift * 100).toFixed(2)}%</p>
                <div className="model-perf-drift-bar"><div className="model-perf-drift-fill" style={{ width: `${Math.min(100, drift.riskPredictionDrift * 500)}%` }} /></div>
              </div>
              <div className="model-perf-drift-card">
                <h4>{t('modelPerformance.fraudInputDrift')}</h4>
                <p className="model-perf-drift-value">{(drift.fraudInputDrift * 100).toFixed(2)}%</p>
                <div className="model-perf-drift-bar"><div className="model-perf-drift-fill" style={{ width: `${Math.min(100, drift.fraudInputDrift * 500)}%` }} /></div>
              </div>
              <div className="model-perf-drift-card">
                <h4>{t('modelPerformance.fraudPredictionDrift')}</h4>
                <p className="model-perf-drift-value">{(drift.fraudPredictionDrift * 100).toFixed(2)}%</p>
                <div className="model-perf-drift-bar"><div className="model-perf-drift-fill" style={{ width: `${Math.min(100, drift.fraudPredictionDrift * 500)}%` }} /></div>
              </div>
            </div>
          </section>
        )}

        <section className="model-perf-section">
          <h3 className="model-perf-section-title">{t('modelPerformance.versionHistory')}</h3>
          <p className="model-perf-section-desc">{t('modelPerformance.versionDesc')}</p>
          <div className="model-perf-table-wrap">
            <table className="model-perf-table">
              <thead>
                <tr>
                  <th>{t('modelPerformance.version')}</th>
                  <th>{t('modelPerformance.deployedAt')}</th>
                  <th>{t('modelPerformance.accuracy')}</th>
                  <th>{t('modelPerformance.status')}</th>
                </tr>
              </thead>
              <tbody>
                {versionHistory.map((v) => (
                  <tr key={v.versionId}>
                    <td><strong>{v.name}</strong></td>
                    <td>{v.deployedAt}</td>
                    <td>{(v.accuracy * 100).toFixed(1)}%</td>
                    <td>
                      <span className={`model-perf-status model-perf-status-${v.status}`}>
                        {v.status === 'active' ? t('modelPerformance.statusActive') : t('modelPerformance.statusDeprecated')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {versionHistory.length === 0 && (
            <p className="model-perf-empty">No version history.</p>
          )}
        </section>
      </div>
    </InsuranceScreen>
  )
}
