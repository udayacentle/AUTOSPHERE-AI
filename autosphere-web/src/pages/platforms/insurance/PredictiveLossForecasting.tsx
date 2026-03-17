import { Link } from 'react-router-dom'
import InsuranceScreen from './InsuranceScreen'
import { api, type InsurancePredictiveLossForecastingData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_PREDICTIVE_LOSS } from './insuranceFallbackData'
import './PredictiveLossForecasting.css'

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return d
  }
}

export default function PredictiveLossForecasting() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<InsurancePredictiveLossForecastingData>(() =>
    api.getInsurancePredictiveLossForecasting()
  )

  const displayData = (data != null && typeof data === 'object') ? data : (error ? FALLBACK_PREDICTIVE_LOSS : null)

  if (loading && !displayData) {
    return (
      <InsuranceScreen
        title={t('predictiveLossForecasting.title')}
        subtitle={t('predictiveLossForecasting.subtitle')}
      >
        <p className="loss-forecast-loading">{t('common.loading')}</p>
      </InsuranceScreen>
    )
  }

  if (!displayData) {
    return (
      <InsuranceScreen
        title={t('predictiveLossForecasting.title')}
        subtitle={t('predictiveLossForecasting.subtitle')}
      >
        <div className="loss-forecast-error">
          <p>{t('predictiveLossForecasting.loadFailed')}</p>
          <button type="button" className="loss-forecast-btn" onClick={() => refetch()}>
            {t('common.refresh')}
          </button>
        </div>
      </InsuranceScreen>
    )
  }

  const isLive = !error && displayData?.dataSource === 'live'
  const lossForecast = displayData?.lossForecast ?? []
  const reserve = displayData?.reserveRecommendations
  const scenarios = displayData?.scenarioAnalysis ?? []
  const summary = displayData?.summary

  return (
    <InsuranceScreen
      title={t('predictiveLossForecasting.title')}
      subtitle={t('predictiveLossForecasting.subtitle')}
    >
      <div className="loss-forecast-page">
        <div className="loss-forecast-toolbar">
          <div className="loss-forecast-toolbar-left">
            <span className={`loss-forecast-badge ${isLive ? 'loss-forecast-badge-live' : 'loss-forecast-badge-sample'}`}>
              {isLive ? t('predictiveLossForecasting.dataSourceLive') : t('predictiveLossForecasting.dataSourceSample')}
            </span>
            {displayData.lastUpdated && (
              <span className="loss-forecast-last-updated">
                {t('predictiveLossForecasting.lastUpdated')}: {formatDate(displayData.lastUpdated)}
              </span>
            )}
          </div>
          <button type="button" className="loss-forecast-btn" onClick={() => refetch()}>
            {t('predictiveLossForecasting.refresh')}
          </button>
        </div>

        {error && (
          <div className="loss-forecast-sample-banner">
            <span>{t('common.sampleDataBanner')}</span>
            <button type="button" className="loss-forecast-btn" onClick={() => refetch()}>
              {t('common.refresh')}
            </button>
          </div>
        )}

        <nav className="loss-forecast-quick-actions">
          <Link to="portfolio-overview-dashboard" className="loss-forecast-quick-link">{t('predictiveLossForecasting.viewPortfolio')}</Link>
          <Link to="claims-management-dashboard" className="loss-forecast-quick-link">{t('predictiveLossForecasting.viewClaims')}</Link>
          <Link to="real-time-risk-monitor" className="loss-forecast-quick-link">{t('predictiveLossForecasting.viewRiskMonitor')}</Link>
        </nav>

        {summary && (
          <div className="loss-forecast-kpis">
            <div className="loss-forecast-kpi-card">
              <h3>{t('predictiveLossForecasting.totalPremium')}</h3>
              <p className="loss-forecast-kpi-value">${summary.totalPremium.toLocaleString()}</p>
            </div>
            <div className="loss-forecast-kpi-card">
              <h3>{t('predictiveLossForecasting.paidToDate')}</h3>
              <p className="loss-forecast-kpi-value">${summary.paidToDate.toLocaleString()}</p>
            </div>
            <div className="loss-forecast-kpi-card">
              <h3>{t('predictiveLossForecasting.openClaimsCount')}</h3>
              <p className="loss-forecast-kpi-value">{summary.openClaimsCount}</p>
            </div>
          </div>
        )}

        <section className="loss-forecast-section">
          <h3 className="loss-forecast-section-title">{t('predictiveLossForecasting.lossForecast')}</h3>
          <p className="loss-forecast-section-desc">{t('predictiveLossForecasting.lossForecastDesc')}</p>
          <div className="loss-forecast-table-wrap">
            <table className="loss-forecast-table">
              <thead>
                <tr>
                  <th>{t('predictiveLossForecasting.period')}</th>
                  <th>{t('predictiveLossForecasting.expectedLoss')}</th>
                  <th>{t('predictiveLossForecasting.claimCount')}</th>
                </tr>
              </thead>
              <tbody>
                {lossForecast.map((row) => (
                  <tr key={row.periodKey}>
                    <td>{row.periodLabel}</td>
                    <td>${row.expectedLoss.toLocaleString()}</td>
                    <td>{row.claimCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {lossForecast.length === 0 && (
            <p className="loss-forecast-empty">No forecast data.</p>
          )}
        </section>

        {reserve && (
          <section className="loss-forecast-section">
            <h3 className="loss-forecast-section-title">{t('predictiveLossForecasting.reserveRecommendations')}</h3>
            <p className="loss-forecast-section-desc">{t('predictiveLossForecasting.reserveDesc')}</p>
            <div className="loss-forecast-reserve-grid">
              <div className="loss-forecast-reserve-card">
                <h4>{t('predictiveLossForecasting.openClaimsReserve')}</h4>
                <p className="loss-forecast-reserve-value">${reserve.openClaimsReserve.toLocaleString()}</p>
              </div>
              <div className="loss-forecast-reserve-card">
                <h4>{t('predictiveLossForecasting.ibnrRecommendation')}</h4>
                <p className="loss-forecast-reserve-value">${reserve.ibnrRecommendation.toLocaleString()}</p>
              </div>
              <div className="loss-forecast-reserve-card">
                <h4>{t('predictiveLossForecasting.caseReserveRecommendation')}</h4>
                <p className="loss-forecast-reserve-value">${reserve.caseReserveRecommendation.toLocaleString()}</p>
              </div>
            </div>
          </section>
        )}

        <section className="loss-forecast-section">
          <h3 className="loss-forecast-section-title">{t('predictiveLossForecasting.scenarioAnalysis')}</h3>
          <p className="loss-forecast-section-desc">{t('predictiveLossForecasting.scenarioDesc')}</p>
          <div className="loss-forecast-table-wrap">
            <table className="loss-forecast-table">
              <thead>
                <tr>
                  <th>{t('predictiveLossForecasting.scenario')}</th>
                  <th>{t('predictiveLossForecasting.description')}</th>
                  <th>{t('predictiveLossForecasting.projectedLossRatio')}</th>
                  <th>{t('predictiveLossForecasting.projectedTotalLoss')}</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((s) => (
                  <tr key={s.id}>
                    <td><strong>{s.name}</strong></td>
                    <td>{s.description}</td>
                    <td>{(s.projectedLossRatio * 100).toFixed(1)}%</td>
                    <td>${s.projectedTotalLoss.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {scenarios.length === 0 && (
            <p className="loss-forecast-empty">No scenario data.</p>
          )}
        </section>
      </div>
    </InsuranceScreen>
  )
}
