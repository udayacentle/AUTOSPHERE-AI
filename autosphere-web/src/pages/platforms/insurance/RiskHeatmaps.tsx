import { Link } from 'react-router-dom'
import InsuranceScreen from './InsuranceScreen'
import { api, type InsuranceRiskHeatmapsData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_RISK_HEATMAPS } from './insuranceFallbackData'
import './RiskHeatmaps.css'

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return d
  }
}

export default function RiskHeatmaps() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<InsuranceRiskHeatmapsData>(() =>
    api.getInsuranceRiskHeatmaps()
  )

  const displayData = (data != null && typeof data === 'object') ? data : (error ? FALLBACK_RISK_HEATMAPS : null)

  if (loading && !displayData) {
    return (
      <InsuranceScreen
        title={t('riskHeatmaps.title')}
        subtitle={t('riskHeatmaps.subtitle')}
      >
        <p className="risk-heat-loading">{t('common.loading')}</p>
      </InsuranceScreen>
    )
  }

  if (!displayData) {
    return (
      <InsuranceScreen
        title={t('riskHeatmaps.title')}
        subtitle={t('riskHeatmaps.subtitle')}
      >
        <div className="risk-heat-error">
          <p>{t('riskHeatmaps.loadFailed')}</p>
          <button type="button" className="risk-heat-btn" onClick={() => refetch()}>
            {t('common.refresh')}
          </button>
        </div>
      </InsuranceScreen>
    )
  }

  const isLive = !error && displayData?.dataSource === 'live'
  const regionHeatmap = displayData?.regionHeatmap ?? []
  const timeHeatmap = displayData?.timeHeatmap ?? []
  const segmentHeatmap = displayData?.segmentHeatmap ?? []

  return (
    <InsuranceScreen
      title={t('riskHeatmaps.title')}
      subtitle={t('riskHeatmaps.subtitle')}
    >
      <div className="risk-heat-page">
        <div className="risk-heat-toolbar">
          <div className="risk-heat-toolbar-left">
            <span className={`risk-heat-badge ${isLive ? 'risk-heat-badge-live' : 'risk-heat-badge-sample'}`}>
              {isLive ? t('riskHeatmaps.dataSourceLive') : t('riskHeatmaps.dataSourceSample')}
            </span>
            {displayData?.lastUpdated && (
              <span className="risk-heat-last-updated">
                {t('riskHeatmaps.lastUpdated')}: {formatDate(displayData.lastUpdated)}
              </span>
            )}
          </div>
          <button type="button" className="risk-heat-btn" onClick={() => refetch()}>
            {t('riskHeatmaps.refresh')}
          </button>
        </div>

        {error && (
          <div className="risk-heat-sample-banner">
            <span>{t('common.sampleDataBanner')}</span>
            <button type="button" className="risk-heat-btn" onClick={() => refetch()}>
              {t('common.refresh')}
            </button>
          </div>
        )}

        <nav className="risk-heat-quick-actions">
          <Link to="portfolio-overview-dashboard" className="risk-heat-quick-link">{t('riskHeatmaps.viewPortfolio')}</Link>
          <Link to="claims-management-dashboard" className="risk-heat-quick-link">{t('riskHeatmaps.viewClaims')}</Link>
          <Link to="real-time-risk-monitor" className="risk-heat-quick-link">{t('riskHeatmaps.viewRiskMonitor')}</Link>
        </nav>

        <section className="risk-heat-section">
          <h3 className="risk-heat-section-title">{t('riskHeatmaps.regionHeatmap')}</h3>
          <p className="risk-heat-section-desc">{t('riskHeatmaps.regionHeatmapDesc')}</p>
          <div className="risk-heat-grid">
            {regionHeatmap.map((row) => (
              <div
                key={row.regionKey}
                className={`risk-heat-cell risk-heat-cell-${row.riskLevel}`}
                title={`${row.claimCount} claims, $${row.totalAmount.toLocaleString()}`}
              >
                <span className="risk-heat-cell-label">{row.regionLabel}</span>
                <span className="risk-heat-cell-meta">{row.claimCount} {t('riskHeatmaps.claimCount')} · ${row.totalAmount.toLocaleString()}</span>
                <span className="risk-heat-cell-level">{t(`riskHeatmaps.${row.riskLevel}`)}</span>
              </div>
            ))}
          </div>
          {regionHeatmap.length === 0 && (
            <p className="risk-heat-empty">No region data.</p>
          )}
        </section>

        <section className="risk-heat-section">
          <h3 className="risk-heat-section-title">{t('riskHeatmaps.timeSegment')}</h3>
          <p className="risk-heat-section-desc">{t('riskHeatmaps.timeSegmentDesc')}</p>
          <div className="risk-heat-grid">
            {timeHeatmap.map((row) => (
              <div
                key={row.periodKey}
                className={`risk-heat-cell risk-heat-cell-${row.riskLevel}`}
                title={`${row.claimCount} claims, $${row.totalAmount.toLocaleString()}`}
              >
                <span className="risk-heat-cell-label">{row.periodLabel}</span>
                <span className="risk-heat-cell-meta">{row.claimCount} {t('riskHeatmaps.claimCount')} · ${row.totalAmount.toLocaleString()}</span>
                <span className="risk-heat-cell-level">{t(`riskHeatmaps.${row.riskLevel}`)}</span>
              </div>
            ))}
          </div>
          {timeHeatmap.length === 0 && (
            <p className="risk-heat-empty">No time period data.</p>
          )}
        </section>

        <section className="risk-heat-section">
          <h3 className="risk-heat-section-title">{t('riskHeatmaps.segmentHeatmap')}</h3>
          <p className="risk-heat-section-desc">{t('riskHeatmaps.segmentHeatmapDesc')}</p>
          <div className="risk-heat-table-wrap">
            <table className="risk-heat-table">
              <thead>
                <tr>
                  <th>{t('riskHeatmaps.segment')}</th>
                  <th>{t('riskHeatmaps.claimCount')}</th>
                  <th>{t('riskHeatmaps.totalAmount')}</th>
                  <th>{t('riskHeatmaps.riskLevel')}</th>
                </tr>
              </thead>
              <tbody>
                {segmentHeatmap.map((row) => (
                  <tr key={row.segmentKey}>
                    <td>{row.segmentLabel}</td>
                    <td>{row.claimCount}</td>
                    <td>${row.totalAmount.toLocaleString()}</td>
                    <td>
                      <span className={`risk-heat-level-badge risk-heat-level-${row.riskLevel}`}>
                        {t(`riskHeatmaps.${row.riskLevel}`)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {segmentHeatmap.length === 0 && (
            <p className="risk-heat-empty">No segment data.</p>
          )}
        </section>
      </div>
    </InsuranceScreen>
  )
}
