import { Link } from 'react-router-dom'
import SalesScreen from './SalesScreen'
import { api, type SalesTargetAchievementData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_SALES_TARGET_ACHIEVEMENT } from './salesFallbackData'
import './SalesSection.css'

export default function TargetAchievementTracker() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<SalesTargetAchievementData>(() => api.getSalesTargetAchievement())
  const displayData = (data != null && typeof data === 'object') ? data : (error ? FALLBACK_SALES_TARGET_ACHIEVEMENT : null)

  if (loading && !displayData) {
    return (
      <SalesScreen title="Target Achievement Tracker" subtitle="Track progress toward sales targets">
        <p className="sales-loading">{t('common.loading')}</p>
      </SalesScreen>
    )
  }
  if (!displayData) {
    return (
      <SalesScreen title="Target Achievement Tracker" subtitle="Track progress toward sales targets">
        <div className="sales-error">
          <p>Could not load targets.</p>
          <button type="button" className="sales-btn" onClick={() => refetch()}>{t('common.refresh')}</button>
        </div>
      </SalesScreen>
    )
  }

  const isLive = !error && displayData?.dataSource === 'live'
  const progressPercent = displayData?.progressPercent ?? 0

  return (
    <SalesScreen title="Target Achievement Tracker" subtitle="Track progress toward sales targets">
      <div className="sales-page">
        <div className="sales-toolbar">
          <span className={`sales-badge ${isLive ? 'sales-badge-live' : 'sales-badge-sample'}`}>
            {isLive ? 'Live data' : 'Sample data'}
          </span>
          {displayData?.lastUpdated && (
            <span className="sales-meta">Last updated: {new Date(displayData.lastUpdated).toLocaleString()}</span>
          )}
          <button type="button" className="sales-btn" onClick={() => refetch()}>{t('common.refresh')}</button>
        </div>
        {error && (
          <div className="sales-sample-banner">
            <span>{t('common.sampleDataBanner')}</span>
            <button type="button" className="sales-btn" onClick={() => refetch()}>{t('common.refresh')}</button>
          </div>
        )}
        <nav className="sales-quick-links">
          <Link to="sales-dashboard">Dashboard</Link>
          <Link to="performance-metrics">Performance</Link>
          <Link to="commission-tracker">Commission</Link>
        </nav>
        <div className="sales-kpis">
          <div className="sales-kpi-card">
            <h3>Target units</h3>
            <p className="sales-kpi-value">{displayData?.targetUnits ?? 0}</p>
          </div>
          <div className="sales-kpi-card">
            <h3>Achieved units</h3>
            <p className="sales-kpi-value">{displayData?.achievedUnits ?? 0}</p>
          </div>
          <div className="sales-kpi-card">
            <h3>Target revenue</h3>
            <p className="sales-kpi-value">${(displayData?.targetRevenue ?? 0).toLocaleString()}</p>
          </div>
          <div className="sales-kpi-card">
            <h3>Achieved revenue</h3>
            <p className="sales-kpi-value">${(displayData?.achievedRevenue ?? 0).toLocaleString()}</p>
          </div>
          <div className="sales-kpi-card">
            <h3>Days left</h3>
            <p className="sales-kpi-value">{displayData?.daysLeftInPeriod ?? 0}</p>
          </div>
          <div className="sales-kpi-card">
            <h3>Progress</h3>
            <p className="sales-kpi-value">{(displayData?.progressPercent ?? 0).toFixed(1)}%</p>
          </div>
          <div className="sales-kpi-card">
            <h3>Gap (units)</h3>
            <p className="sales-kpi-value">{displayData?.gapUnits ?? 0}</p>
          </div>
          <div className="sales-kpi-card">
            <h3>Forecast at run rate</h3>
            <p className="sales-kpi-value">{displayData?.forecastAtRunRate ?? 0}</p>
          </div>
        </div>
        <section className="sales-section">
          <h3>Target vs actual</h3>
          <p className="sales-desc">% of target achieved, days left in period.</p>
          <div className="sales-progress-bar" style={{ marginTop: '0.5rem' }}>
            <div className="sales-progress-fill" style={{ width: `${Math.min(100, progressPercent)}%` }} />
          </div>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Gap: {displayData?.gapUnits ?? 0} units, ${(displayData?.gapRevenue ?? 0).toLocaleString()} revenue. Forecast at current run rate: {displayData?.forecastAtRunRate ?? 0} units.
          </p>
        </section>
      </div>
    </SalesScreen>
  )
}
