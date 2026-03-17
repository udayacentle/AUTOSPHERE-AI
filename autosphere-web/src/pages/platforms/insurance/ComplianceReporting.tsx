import { Link } from 'react-router-dom'
import InsuranceScreen from './InsuranceScreen'
import { api, type InsuranceComplianceReportingData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_COMPLIANCE } from './insuranceFallbackData'
import './ComplianceReporting.css'

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return d
  }
}

export default function ComplianceReporting() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<InsuranceComplianceReportingData>(() =>
    api.getInsuranceComplianceReporting()
  )

  const displayData = (data != null && typeof data === 'object') ? data : (error ? FALLBACK_COMPLIANCE : null)

  if (loading && !displayData) {
    return (
      <InsuranceScreen
        title={t('complianceReporting.title')}
        subtitle={t('complianceReporting.subtitle')}
      >
        <p className="compliance-loading">{t('common.loading')}</p>
      </InsuranceScreen>
    )
  }

  if (!displayData) {
    return (
      <InsuranceScreen
        title={t('complianceReporting.title')}
        subtitle={t('complianceReporting.subtitle')}
      >
        <div className="compliance-error">
          <p>{t('complianceReporting.loadFailed')}</p>
          <button type="button" className="compliance-btn" onClick={() => refetch()}>
            {t('common.refresh')}
          </button>
        </div>
      </InsuranceScreen>
    )
  }

  const isLive = !error && displayData?.dataSource === 'live'
  const regulatoryReports = displayData?.regulatoryReports ?? []
  const auditTrail = displayData?.auditTrail ?? []
  const exportOptions = displayData?.exportOptions ?? []
  const summary = displayData?.summary

  return (
    <InsuranceScreen
      title={t('complianceReporting.title')}
      subtitle={t('complianceReporting.subtitle')}
    >
      <div className="compliance-page">
        <div className="compliance-toolbar">
          <div className="compliance-toolbar-left">
            <span className={`compliance-badge ${isLive ? 'compliance-badge-live' : 'compliance-badge-sample'}`}>
              {isLive ? t('complianceReporting.dataSourceLive') : t('complianceReporting.dataSourceSample')}
            </span>
            {displayData.lastUpdated && (
              <span className="compliance-last-updated">
                {t('complianceReporting.lastUpdated')}: {formatDate(displayData.lastUpdated)}
              </span>
            )}
          </div>
          <button type="button" className="compliance-btn" onClick={() => refetch()}>
            {t('complianceReporting.refresh')}
          </button>
        </div>

        {error && (
          <div className="compliance-sample-banner">
            <span>{t('common.sampleDataBanner')}</span>
            <button type="button" className="compliance-btn" onClick={() => refetch()}>
              {t('common.refresh')}
            </button>
          </div>
        )}

        <nav className="compliance-quick-actions">
          <Link to="portfolio-overview-dashboard" className="compliance-quick-link">{t('complianceReporting.viewPortfolio')}</Link>
          <Link to="claims-management-dashboard" className="compliance-quick-link">{t('complianceReporting.viewClaims')}</Link>
          <Link to="real-time-risk-monitor" className="compliance-quick-link">{t('complianceReporting.viewRiskMonitor')}</Link>
        </nav>

        {summary && (
          <div className="compliance-kpis">
            <div className="compliance-kpi-card">
              <h3>{t('complianceReporting.reportsDue')}</h3>
              <p className="compliance-kpi-value">{summary.totalReportsDue}</p>
            </div>
            <div className="compliance-kpi-card">
              <h3>{t('complianceReporting.lastAudit')}</h3>
              <p className="compliance-kpi-value compliance-kpi-small">{formatDate(summary.lastAuditAt)}</p>
            </div>
            <div className="compliance-kpi-card">
              <h3>{t('complianceReporting.totalRegulatoryReports')}</h3>
              <p className="compliance-kpi-value">{summary.totalRegulatoryReports}</p>
            </div>
          </div>
        )}

        <section className="compliance-section">
          <h3 className="compliance-section-title">{t('complianceReporting.regulatoryReports')}</h3>
          <p className="compliance-section-desc">{t('complianceReporting.regulatoryDesc')}</p>
          <div className="compliance-table-wrap">
            <table className="compliance-table">
              <thead>
                <tr>
                  <th>{t('complianceReporting.reportId')}</th>
                  <th>{t('complianceReporting.name')}</th>
                  <th>{t('complianceReporting.jurisdiction')}</th>
                  <th>{t('complianceReporting.dueDate')}</th>
                  <th>{t('complianceReporting.period')}</th>
                  <th>{t('complianceReporting.status')}</th>
                </tr>
              </thead>
              <tbody>
                {regulatoryReports.map((r) => (
                  <tr key={r.reportId}>
                    <td className="compliance-id">{r.reportId}</td>
                    <td>{r.name}</td>
                    <td>{r.jurisdiction}</td>
                    <td>{formatDate(r.dueDate)}</td>
                    <td>{r.period}</td>
                    <td>
                      <span className={`compliance-status compliance-status-${r.status}`}>
                        {r.status === 'due' ? t('complianceReporting.statusDue') : r.status === 'filed' ? t('complianceReporting.statusFiled') : t('complianceReporting.statusUpcoming')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {regulatoryReports.length === 0 && (
            <p className="compliance-empty">No regulatory reports.</p>
          )}
        </section>

        <section className="compliance-section">
          <h3 className="compliance-section-title">{t('complianceReporting.auditTrail')}</h3>
          <p className="compliance-section-desc">{t('complianceReporting.auditDesc')}</p>
          <div className="compliance-table-wrap">
            <table className="compliance-table">
              <thead>
                <tr>
                  <th>{t('complianceReporting.type')}</th>
                  <th>{t('complianceReporting.action')}</th>
                  <th>{t('complianceReporting.entityId')}</th>
                  <th>{t('complianceReporting.at')}</th>
                  <th>{t('complianceReporting.detail')}</th>
                </tr>
              </thead>
              <tbody>
                {auditTrail.map((a) => (
                  <tr key={a.id}>
                    <td><span className={`compliance-type compliance-type-${a.type}`}>{a.type}</span></td>
                    <td>{a.action}</td>
                    <td className="compliance-id">{a.entityId}</td>
                    <td>{formatDate(a.at)}</td>
                    <td className="compliance-detail">{a.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {auditTrail.length === 0 && (
            <p className="compliance-empty">No audit entries.</p>
          )}
        </section>

        <section className="compliance-section">
          <h3 className="compliance-section-title">{t('complianceReporting.exportSchedule')}</h3>
          <p className="compliance-section-desc">{t('complianceReporting.exportDesc')}</p>
          <div className="compliance-export-grid">
            {exportOptions.map((e) => (
              <div key={`${e.format}-${e.reportType}`} className="compliance-export-card">
                <h4>{e.reportType}</h4>
                <p className="compliance-export-format">{e.format}</p>
                <p className="compliance-export-desc">{e.description}</p>
              </div>
            ))}
          </div>
          {exportOptions.length === 0 && (
            <p className="compliance-empty">No export options.</p>
          )}
        </section>
      </div>
    </InsuranceScreen>
  )
}
