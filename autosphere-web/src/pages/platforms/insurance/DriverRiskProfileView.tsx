import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import InsuranceScreen from './InsuranceScreen'
import { api, type InsuranceDriversRiskData, type InsuranceDriverRiskItem } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_DRIVERS_RISK } from './insuranceFallbackData'
import './DriverRiskProfileView.css'

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString(undefined, { dateStyle: 'short' })
  } catch {
    return d
  }
}

function getRiskLevel(riskScore: number): 'high' | 'medium' | 'low' {
  if (riskScore >= 40) return 'high'
  if (riskScore >= 25) return 'medium'
  return 'low'
}

function getRiskLevelLabel(level: string, t: (k: string) => string): string {
  if (level === 'high') return t('driverRiskProfile.high')
  if (level === 'medium') return t('driverRiskProfile.medium')
  return t('driverRiskProfile.low')
}

export default function DriverRiskProfileView() {
  const { t } = useI18n()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortDesc, setSortDesc] = useState(true)
  const { data, loading, error, refetch } = useApiData<InsuranceDriversRiskData>(() =>
    api.getInsuranceDriversRisk()
  )

  const displayData = (data != null && typeof data === 'object') ? data : (error ? FALLBACK_DRIVERS_RISK : null)
  const drivers = displayData?.drivers ?? []
  const isLive = !error && (displayData?.dataSource === 'live')

  const filteredAndSorted = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    let list = q
      ? drivers.filter((d) => (d.name || '').toLowerCase().includes(q))
      : [...drivers]
    list.sort((a, b) => (sortDesc ? b.riskScore - a.riskScore : a.riskScore - b.riskScore))
    return list
  }, [drivers, searchQuery, sortDesc])

  if (loading && !displayData) {
    return (
      <InsuranceScreen
        title={t('driverRiskProfile.title')}
        subtitle={t('driverRiskProfile.subtitle')}
      >
        <p className="driver-risk-loading">{t('common.loading')}</p>
      </InsuranceScreen>
    )
  }

  if (!displayData) {
    return (
      <InsuranceScreen
        title={t('driverRiskProfile.title')}
        subtitle={t('driverRiskProfile.subtitle')}
      >
        <div className="driver-risk-error">
          <p>{t('driverRiskProfile.loadFailed')}</p>
          <button type="button" className="driver-risk-btn" onClick={() => refetch()}>
            {t('common.refresh')}
          </button>
        </div>
      </InsuranceScreen>
    )
  }

  return (
    <InsuranceScreen
      title={t('driverRiskProfile.title')}
      subtitle={t('driverRiskProfile.subtitle')}
    >
      <div className="driver-risk-page">
        <div className="driver-risk-toolbar">
          <div className="driver-risk-toolbar-left">
            <span className={`driver-risk-badge ${isLive ? 'driver-risk-badge-live' : 'driver-risk-badge-sample'}`}>
              {isLive ? t('driverRiskProfile.dataSourceLive') : t('driverRiskProfile.dataSourceSample')}
            </span>
            {displayData.lastUpdated && (
              <span className="driver-risk-last-updated">
                {t('driverRiskProfile.lastUpdated')}: {formatDate(displayData.lastUpdated)}
              </span>
            )}
          </div>
          <button type="button" className="driver-risk-btn" onClick={() => refetch()}>
            {t('driverRiskProfile.refresh')}
          </button>
        </div>

        {error && (
          <div className="driver-risk-sample-banner">
            <span>{t('common.sampleDataBanner')}</span>
            <button type="button" className="driver-risk-btn" onClick={() => refetch()}>
              {t('common.refresh')}
            </button>
          </div>
        )}

        <nav className="driver-risk-quick-actions">
          <Link to="portfolio-overview-dashboard" className="driver-risk-quick-link">{t('driverRiskProfile.viewPortfolio')}</Link>
          <Link to="real-time-risk-monitor" className="driver-risk-quick-link">{t('driverRiskProfile.viewRiskMonitor')}</Link>
          <Link to="claims-management-dashboard" className="driver-risk-quick-link">{t('driverRiskProfile.viewClaims')}</Link>
        </nav>

        <div className="driver-risk-filters">
          <input
            type="search"
            className="driver-risk-search"
            placeholder={t('driverRiskProfile.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="button"
            className="driver-risk-sort-btn"
            onClick={() => setSortDesc((x) => !x)}
          >
            {t('driverRiskProfile.sortByRisk')} {sortDesc ? '↓' : '↑'}
          </button>
        </div>

        {filteredAndSorted.length === 0 && (
          <p className="driver-risk-empty">{t('driverRiskProfile.noDrivers')}</p>
        )}

        <div className="driver-risk-table-wrap">
          <table className="driver-risk-table">
            <thead>
              <tr>
                <th>{t('driverRiskProfile.driver')}</th>
                <th>{t('driverRiskProfile.riskLevel')}</th>
                <th>{t('driverRiskProfile.riskScore')}</th>
                <th>{t('driverRiskProfile.mobilityScore')}</th>
                <th>{t('driverRiskProfile.email')}</th>
                <th>{t('driverRiskProfile.claims')}</th>
                <th>{t('driverRiskProfile.policy')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map((d: InsuranceDriverRiskItem) => {
                const level = getRiskLevel(d.riskScore)
                return (
                  <tr key={d.driverId}>
                    <td className="driver-risk-name">{d.name}</td>
                    <td>
                      <span className={`driver-risk-tier tier-${level}`}>
                        {getRiskLevelLabel(level, t)}
                      </span>
                    </td>
                    <td><strong>{d.riskScore}</strong></td>
                    <td>{d.mobilityScore}</td>
                    <td className="driver-risk-email">{d.email || '—'}</td>
                    <td>{d.claimCount ?? 0}</td>
                    <td>
                      {d.policyProvider ? (
                        <span title={d.policyExpiry ? formatDate(d.policyExpiry) : ''}>
                          {d.policyProvider}
                          {d.policyExpiry && (
                            <span className="driver-risk-expiry"> · {formatDate(d.policyExpiry)}</span>
                          )}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </InsuranceScreen>
  )
}
