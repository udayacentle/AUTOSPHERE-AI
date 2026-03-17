import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import InsuranceScreen from './InsuranceScreen'
import { api, type InsurancePoliciesData, type InsurancePolicyListItem } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_POLICIES } from './insuranceFallbackData'
import './PolicyManagement.css'

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString(undefined, { dateStyle: 'short' })
  } catch {
    return d
  }
}

function isExpiringWithinDays(expiryStr: string, days: number): boolean {
  if (!expiryStr) return false
  try {
    const expiry = new Date(expiryStr)
    const now = new Date()
    const limit = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
    return expiry >= now && expiry <= limit
  } catch {
    return false
  }
}

export default function PolicyManagement() {
  const { t } = useI18n()
  const [providerFilter, setProviderFilter] = useState<string>('')
  const [coverageFilter, setCoverageFilter] = useState<string>('')
  const { data, loading, error, refetch } = useApiData<InsurancePoliciesData>(() =>
    api.getInsurancePolicies()
  )

  const displayData = (data != null && typeof data === 'object') ? data : (error ? FALLBACK_POLICIES : null)
  const policies = displayData?.policies ?? []
  const summary = displayData?.summary
  const isLive = !error && (displayData?.dataSource === 'live')

  const providerOptions = useMemo(() => {
    const set = new Set(policies.map((p) => p.provider).filter(Boolean))
    return Array.from(set).sort()
  }, [policies])
  const coverageOptions = useMemo(() => {
    const set = new Set(policies.map((p) => p.coverage).filter(Boolean))
    return Array.from(set).sort()
  }, [policies])

  const filteredPolicies = useMemo(() => {
    return policies.filter((p) => {
      if (providerFilter && p.provider !== providerFilter) return false
      if (coverageFilter && p.coverage !== coverageFilter) return false
      return true
    })
  }, [policies, providerFilter, coverageFilter])

  if (loading && !displayData) {
    return (
      <InsuranceScreen
        title={t('policyManagement.title')}
        subtitle={t('policyManagement.subtitle')}
      >
        <p className="policy-mgmt-loading">{t('common.loading')}</p>
      </InsuranceScreen>
    )
  }

  if (!displayData) {
    return (
      <InsuranceScreen
        title={t('policyManagement.title')}
        subtitle={t('policyManagement.subtitle')}
      >
        <div className="policy-mgmt-error">
          <p>{t('policyManagement.loadFailed')}</p>
          <button type="button" className="policy-mgmt-btn" onClick={() => refetch()}>
            {t('common.refresh')}
          </button>
        </div>
      </InsuranceScreen>
    )
  }

  return (
    <InsuranceScreen
      title={t('policyManagement.title')}
      subtitle={t('policyManagement.subtitle')}
    >
      <div className="policy-mgmt-page">
        <div className="policy-mgmt-toolbar">
          <div className="policy-mgmt-toolbar-left">
            <span className={`policy-mgmt-badge ${isLive ? 'policy-mgmt-badge-live' : 'policy-mgmt-badge-sample'}`}>
              {isLive ? t('policyManagement.dataSourceLive') : t('policyManagement.dataSourceSample')}
            </span>
            {displayData.lastUpdated && (
              <span className="policy-mgmt-last-updated">
                {t('policyManagement.lastUpdated')}: {formatDate(displayData.lastUpdated)}
              </span>
            )}
          </div>
          <button type="button" className="policy-mgmt-btn" onClick={() => refetch()}>
            {t('policyManagement.refresh')}
          </button>
        </div>

        {error && (
          <div className="policy-mgmt-sample-banner">
            <span>{t('common.sampleDataBanner')}</span>
            <button type="button" className="policy-mgmt-btn" onClick={() => refetch()}>
              {t('common.refresh')}
            </button>
          </div>
        )}

        <nav className="policy-mgmt-quick-actions">
          <Link to="portfolio-overview-dashboard" className="policy-mgmt-quick-link">{t('policyManagement.viewPortfolio')}</Link>
          <Link to="claims-management-dashboard" className="policy-mgmt-quick-link">{t('policyManagement.viewClaims')}</Link>
          <Link to="real-time-risk-monitor" className="policy-mgmt-quick-link">{t('policyManagement.viewRiskMonitor')}</Link>
        </nav>

        {summary && (
          <div className="policy-mgmt-kpis">
            <div className="policy-mgmt-kpi-card">
              <h3>{t('policyManagement.activePolicies')}</h3>
              <p className="policy-mgmt-kpi-value">{summary.totalPolicies}</p>
            </div>
            <div className="policy-mgmt-kpi-card">
              <h3>{t('policyManagement.totalPremium')}</h3>
              <p className="policy-mgmt-kpi-value">${summary.totalPremium.toLocaleString()}</p>
            </div>
            <div className="policy-mgmt-kpi-card">
              <h3>{t('policyManagement.expiringSoon')}</h3>
              <p className="policy-mgmt-kpi-value">{summary.expiringSoonCount}</p>
            </div>
          </div>
        )}

        <div className="policy-mgmt-filters">
          <label className="policy-mgmt-filter-label">
            {t('policyManagement.filterByProvider')}
            <select
              className="policy-mgmt-select"
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
            >
              <option value="">{t('policyManagement.filterAll')}</option>
              {providerOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </label>
          <label className="policy-mgmt-filter-label">
            {t('policyManagement.filterByCoverage')}
            <select
              className="policy-mgmt-select"
              value={coverageFilter}
              onChange={(e) => setCoverageFilter(e.target.value)}
            >
              <option value="">{t('policyManagement.filterAll')}</option>
              {coverageOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </label>
        </div>

        <section className="policy-mgmt-section">
          <h3 className="policy-mgmt-section-title">{t('policyManagement.policyList')}</h3>
          <div className="policy-mgmt-table-wrap">
            <table className="policy-mgmt-table">
              <thead>
                <tr>
                  <th>{t('policyManagement.driver')}</th>
                  <th>{t('policyManagement.provider')}</th>
                  <th>{t('policyManagement.policyNumber')}</th>
                  <th>{t('policyManagement.expiryDate')}</th>
                  <th>{t('policyManagement.premium')}</th>
                  <th>{t('policyManagement.coverage')}</th>
                  <th>{t('policyManagement.status')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredPolicies.map((p: InsurancePolicyListItem, i: number) => {
                  const expiring = isExpiringWithinDays(p.expiryDate, 90)
                  return (
                    <tr key={p.driverId + (p.policyNumber || '') + i}>
                      <td>{p.driverName || p.driverId}</td>
                      <td>{p.provider || '—'}</td>
                      <td className="policy-mgmt-id">{p.policyNumber || '—'}</td>
                      <td>{formatDate(p.expiryDate)}</td>
                      <td>${(p.premium ?? 0).toLocaleString()}</td>
                      <td>{p.coverage || '—'}</td>
                      <td>
                        <span className={`policy-mgmt-status policy-mgmt-status-${expiring ? 'expiring' : 'active'}`}>
                          {expiring ? t('policyManagement.statusExpiring') : t('policyManagement.statusActive')}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filteredPolicies.length === 0 && (
            <p className="policy-mgmt-empty">{t('policyManagement.noPolicies')}</p>
          )}
        </section>
      </div>
    </InsuranceScreen>
  )
}
