import { Link } from 'react-router-dom'
import InsuranceScreen from './InsuranceScreen'
import { api, type InsuranceApiIntegrationSettingsData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_API_INTEGRATION } from './insuranceFallbackData'
import './APIIntegrationSettings.css'

function formatDate(d: string | null) {
  if (!d) return null
  try {
    return new Date(d).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return d
  }
}

function typeLabel(t: (key: string) => string, type: string) {
  if (type === 'autosphere') return t('apiIntegrationSettings.typeAutosphere')
  if (type === 'telematics') return t('apiIntegrationSettings.typeTelematics')
  return t('apiIntegrationSettings.typeThirdParty')
}

export default function APIIntegrationSettings() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<InsuranceApiIntegrationSettingsData>(() =>
    api.getInsuranceApiIntegrationSettings()
  )

  const displayData = (data != null && typeof data === 'object') ? data : (error ? FALLBACK_API_INTEGRATION : null)

  if (loading && !displayData) {
    return (
      <InsuranceScreen
        title={t('apiIntegrationSettings.title')}
        subtitle={t('apiIntegrationSettings.subtitle')}
      >
        <p className="api-settings-loading">{t('common.loading')}</p>
      </InsuranceScreen>
    )
  }

  if (!displayData) {
    return (
      <InsuranceScreen
        title={t('apiIntegrationSettings.title')}
        subtitle={t('apiIntegrationSettings.subtitle')}
      >
        <div className="api-settings-error">
          <p>{t('apiIntegrationSettings.loadFailed')}</p>
          <button type="button" className="api-settings-btn" onClick={() => refetch()}>
            {t('common.refresh')}
          </button>
        </div>
      </InsuranceScreen>
    )
  }

  const isLive = !error && displayData?.dataSource === 'live'
  const apiEndpoints = displayData?.apiEndpoints ?? []
  const webhooks = displayData?.webhooks ?? []
  const rateLimits = displayData?.rateLimits ?? { period: 'monthly', items: [] }

  return (
    <InsuranceScreen
      title={t('apiIntegrationSettings.title')}
      subtitle={t('apiIntegrationSettings.subtitle')}
    >
      <div className="api-settings-page">
        <div className="api-settings-toolbar">
          <div className="api-settings-toolbar-left">
            <span className={`api-settings-badge ${isLive ? 'api-settings-badge-live' : 'api-settings-badge-sample'}`}>
              {isLive ? t('apiIntegrationSettings.dataSourceLive') : t('apiIntegrationSettings.dataSourceSample')}
            </span>
            {displayData.lastUpdated && (
              <span className="api-settings-last-updated">
                {t('apiIntegrationSettings.lastUpdated')}: {formatDate(displayData.lastUpdated) ?? displayData.lastUpdated}
              </span>
            )}
          </div>
          <button type="button" className="api-settings-btn" onClick={() => refetch()}>
            {t('apiIntegrationSettings.refresh')}
          </button>
        </div>

        {error && (
          <div className="api-settings-sample-banner">
            <span>{t('common.sampleDataBanner')}</span>
            <button type="button" className="api-settings-btn" onClick={() => refetch()}>
              {t('common.refresh')}
            </button>
          </div>
        )}

        <nav className="api-settings-quick-actions">
          <Link to="portfolio-overview-dashboard" className="api-settings-quick-link">{t('apiIntegrationSettings.viewPortfolio')}</Link>
          <Link to="claims-management-dashboard" className="api-settings-quick-link">{t('apiIntegrationSettings.viewClaims')}</Link>
          <Link to="compliance-reporting" className="api-settings-quick-link">{t('apiIntegrationSettings.viewCompliance')}</Link>
        </nav>

        <section className="api-settings-section">
          <h3 className="api-settings-section-title">{t('apiIntegrationSettings.apiKeysEndpoints')}</h3>
          <p className="api-settings-section-desc">{t('apiIntegrationSettings.apiKeysDesc')}</p>
          <div className="api-settings-table-wrap">
            <table className="api-settings-table">
              <thead>
                <tr>
                  <th>{t('apiIntegrationSettings.name')}</th>
                  <th>{t('apiIntegrationSettings.type')}</th>
                  <th>{t('apiIntegrationSettings.status')}</th>
                  <th>{t('apiIntegrationSettings.baseUrl')}</th>
                  <th>{t('apiIntegrationSettings.lastUsed')}</th>
                </tr>
              </thead>
              <tbody>
                {apiEndpoints.map((ep) => (
                  <tr key={ep.id}>
                    <td className="api-settings-name">{ep.name}</td>
                    <td><span className={`api-settings-type api-settings-type-${ep.type}`}>{typeLabel(t, ep.type)}</span></td>
                    <td>
                      <span className={`api-settings-status api-settings-status-${ep.status}`}>
                        {ep.status === 'active' ? t('apiIntegrationSettings.statusActive') : t('apiIntegrationSettings.statusInactive')}
                      </span>
                    </td>
                    <td className="api-settings-url">{ep.baseUrlMasked}</td>
                    <td>{formatDate(ep.lastUsed) ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {apiEndpoints.length === 0 && (
            <p className="api-settings-empty">No API endpoints configured.</p>
          )}
        </section>

        <section className="api-settings-section">
          <h3 className="api-settings-section-title">{t('apiIntegrationSettings.webhooks')}</h3>
          <p className="api-settings-section-desc">{t('apiIntegrationSettings.webhooksDesc')}</p>
          <div className="api-settings-table-wrap">
            <table className="api-settings-table">
              <thead>
                <tr>
                  <th>{t('apiIntegrationSettings.eventType')}</th>
                  <th>{t('apiIntegrationSettings.url')}</th>
                  <th>{t('apiIntegrationSettings.status')}</th>
                  <th>{t('apiIntegrationSettings.lastTriggered')}</th>
                </tr>
              </thead>
              <tbody>
                {webhooks.map((wh) => (
                  <tr key={wh.id}>
                    <td className="api-settings-event">{wh.eventType}</td>
                    <td className="api-settings-url">{wh.urlMasked}</td>
                    <td>
                      <span className={`api-settings-status api-settings-status-${wh.status}`}>
                        {wh.status === 'active' ? t('apiIntegrationSettings.statusActive') : t('apiIntegrationSettings.statusInactive')}
                      </span>
                    </td>
                    <td>{formatDate(wh.lastTriggered) ?? t('apiIntegrationSettings.never')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {webhooks.length === 0 && (
            <p className="api-settings-empty">No webhooks configured.</p>
          )}
        </section>

        <section className="api-settings-section">
          <h3 className="api-settings-section-title">{t('apiIntegrationSettings.rateLimitsUsage')}</h3>
          <p className="api-settings-section-desc">{t('apiIntegrationSettings.rateLimitsDesc')}</p>
          <p className="api-settings-period">{t('apiIntegrationSettings.period')}: <strong>{rateLimits.period}</strong></p>
          <div className="api-settings-table-wrap">
            <table className="api-settings-table">
              <thead>
                <tr>
                  <th>{t('apiIntegrationSettings.product')}</th>
                  <th>{t('apiIntegrationSettings.limit')}</th>
                  <th>{t('apiIntegrationSettings.used')}</th>
                  <th>{t('apiIntegrationSettings.remaining')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rateLimits.items.map((r) => (
                  <tr key={r.product}>
                    <td className="api-settings-name">{r.product}</td>
                    <td>{r.limit.toLocaleString()}</td>
                    <td>{r.used.toLocaleString()}</td>
                    <td>{r.remaining.toLocaleString()}</td>
                    <td>
                      <div className="api-settings-usage-bar-wrap">
                        <div
                          className="api-settings-usage-bar"
                          style={{ width: `${Math.min(100, (r.used / r.limit) * 100)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rateLimits.items.length === 0 && (
            <p className="api-settings-empty">No rate limit data.</p>
          )}
        </section>
      </div>
    </InsuranceScreen>
  )
}
