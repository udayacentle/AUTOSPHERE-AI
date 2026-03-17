import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import InsuranceScreen from './InsuranceScreen'
import { api, type InsuranceClaimsData, type InsuranceClaimItem } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_CLAIMS } from './insuranceFallbackData'
import './ClaimsManagementDashboard.css'

const STATUS_FILTERS = ['all', 'open', 'paid', 'submitted', 'assessing', 'approved', 'rejected'] as const

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString(undefined, { dateStyle: 'short' })
  } catch {
    return d
  }
}

function isResolved(status: string) {
  const s = (status || '').toLowerCase()
  return s === 'paid' || s === 'rejected' || s === 'closed'
}

export default function ClaimsManagementDashboard() {
  const { t } = useI18n()
  const [statusFilter, setStatusFilter] = useState<typeof STATUS_FILTERS[number]>('all')
  const { data, loading, error, refetch } = useApiData<InsuranceClaimsData>(() =>
    api.getInsuranceClaims()
  )

  const displayData = (data != null && typeof data === 'object') ? data : (error ? FALLBACK_CLAIMS : null)
  const claims = displayData?.claims ?? []
  const summary = displayData?.summary
  const isLive = !error && displayData?.dataSource === 'live'

  const filteredClaims = useMemo(() => {
    if (statusFilter === 'all') return claims
    if (statusFilter === 'open') return claims.filter((c) => !isResolved(c.status))
    if (statusFilter === 'paid') return claims.filter((c) => (c.status || '').toLowerCase() === 'paid')
    return claims.filter((c) => (c.status || '').toLowerCase() === statusFilter)
  }, [claims, statusFilter])

  if (loading && !displayData) {
    return (
      <InsuranceScreen
        title={t('claimsManagement.title')}
        subtitle={t('claimsManagement.subtitle')}
      >
        <p className="claims-mgmt-loading">{t('common.loading')}</p>
      </InsuranceScreen>
    )
  }

  if (!displayData) {
    return (
      <InsuranceScreen
        title={t('claimsManagement.title')}
        subtitle={t('claimsManagement.subtitle')}
      >
        <div className="claims-mgmt-error">
          <p>{t('claimsManagement.loadFailed')}</p>
          <button type="button" className="claims-mgmt-btn" onClick={() => refetch()}>
            {t('common.refresh')}
          </button>
        </div>
      </InsuranceScreen>
    )
  }

  return (
    <InsuranceScreen
      title={t('claimsManagement.title')}
      subtitle={t('claimsManagement.subtitle')}
    >
      <div className="claims-mgmt-page">
        <div className="claims-mgmt-toolbar">
          <div className="claims-mgmt-toolbar-left">
            <span className={`claims-mgmt-badge ${isLive ? 'claims-mgmt-badge-live' : 'claims-mgmt-badge-sample'}`}>
              {isLive ? t('claimsManagement.dataSourceLive') : t('claimsManagement.dataSourceSample')}
            </span>
            {displayData.lastUpdated && (
              <span className="claims-mgmt-last-updated">
                {t('claimsManagement.lastUpdated')}: {formatDate(displayData.lastUpdated)}
              </span>
            )}
          </div>
          <button type="button" className="claims-mgmt-btn" onClick={() => refetch()}>
            {t('claimsManagement.refresh')}
          </button>
        </div>

        {error && (
          <div className="claims-mgmt-sample-banner">
            <span>{t('common.sampleDataBanner')}</span>
            <button type="button" className="claims-mgmt-btn" onClick={() => refetch()}>
              {t('common.refresh')}
            </button>
          </div>
        )}

        <nav className="claims-mgmt-quick-actions">
          <Link to="portfolio-overview-dashboard" className="claims-mgmt-quick-link">{t('claimsManagement.viewPortfolio')}</Link>
          <Link to="real-time-risk-monitor" className="claims-mgmt-quick-link">{t('claimsManagement.viewRiskMonitor')}</Link>
          <Link to="policy-management" className="claims-mgmt-quick-link">{t('claimsManagement.viewPolicies')}</Link>
        </nav>

        {summary && (
          <div className="claims-mgmt-kpis">
            <div className="claims-mgmt-kpi-card">
              <h3>{t('claimsManagement.openClaims')}</h3>
              <p className="claims-mgmt-kpi-value">{summary.openCount}</p>
            </div>
            <div className="claims-mgmt-kpi-card">
              <h3>{t('claimsManagement.paidCount')}</h3>
              <p className="claims-mgmt-kpi-value">{summary.paidCount}</p>
            </div>
            <div className="claims-mgmt-kpi-card">
              <h3>{t('claimsManagement.totalPaid')}</h3>
              <p className="claims-mgmt-kpi-value">${summary.totalPaidAmount.toLocaleString()}</p>
            </div>
            <div className="claims-mgmt-kpi-card">
              <h3>{t('claimsManagement.totalClaims')}</h3>
              <p className="claims-mgmt-kpi-value">{summary.totalClaims}</p>
            </div>
          </div>
        )}

        <div className="claims-mgmt-filters">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className={`claims-mgmt-filter-btn ${statusFilter === f ? 'claims-mgmt-filter-active' : ''}`}
              onClick={() => setStatusFilter(f)}
            >
              {t(`claimsManagement.filter${f.charAt(0).toUpperCase() + f.slice(1)}`)}
            </button>
          ))}
        </div>

        <section className="claims-mgmt-section">
          <h3 className="claims-mgmt-section-title">{t('claimsManagement.claimsList')}</h3>
          <div className="claims-mgmt-table-wrap">
            <table className="claims-mgmt-table">
              <thead>
                <tr>
                  <th>{t('claimsManagement.claimId')}</th>
                  <th>{t('claimsManagement.driver')}</th>
                  <th>{t('claimsManagement.date')}</th>
                  <th>{t('claimsManagement.amount')}</th>
                  <th>{t('claimsManagement.status')}</th>
                  <th>{t('claimsManagement.damageType')}</th>
                  <th>{t('claimsManagement.description')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.map((c: InsuranceClaimItem) => (
                  <tr key={c.id}>
                    <td className="claims-mgmt-id">{c.id}</td>
                    <td>{c.driverName || c.driverId}</td>
                    <td>{formatDate(c.date)}</td>
                    <td>${(c.amount ?? 0).toLocaleString()}</td>
                    <td>
                      <span className={`claims-mgmt-status status-${(c.status || 'submitted').toLowerCase()}`}>
                        {c.status || '—'}
                      </span>
                    </td>
                    <td>{c.damageType || '—'}</td>
                    <td className="claims-mgmt-desc">{c.description || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredClaims.length === 0 && (
            <p className="claims-mgmt-empty">{t('claimsManagement.noClaims')}</p>
          )}
        </section>
      </div>
    </InsuranceScreen>
  )
}
