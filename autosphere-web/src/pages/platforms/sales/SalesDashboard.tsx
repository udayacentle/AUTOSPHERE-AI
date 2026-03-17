import { Link } from 'react-router-dom'
import SalesScreen from './SalesScreen'
import { api, type SalesDashboardData } from '../../api/client'
import { useApiData } from '../../hooks/useApiData'
import { useI18n } from '../../i18n/context'
import { FALLBACK_SALES_DASHBOARD } from './salesFallbackData'
import './SalesSection.css'

export default function SalesDashboard() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<SalesDashboardData>(() => api.getSalesDashboard())
  const displayData = (data != null && typeof data === 'object') ? data : (error ? FALLBACK_SALES_DASHBOARD : null)

  if (loading && !displayData) {
    return (
      <SalesScreen title="Sales Dashboard" subtitle="Overview for sales personnel — leads, pipeline, and targets">
        <p className="sales-loading">{t('common.loading')}</p>
      </SalesScreen>
    )
  }
  if (!displayData) {
    return (
      <SalesScreen title="Sales Dashboard" subtitle="Overview for sales personnel — leads, pipeline, and targets">
        <div className="sales-error">
          <p>Could not load dashboard.</p>
          <button type="button" className="sales-btn" onClick={() => refetch()}>{t('common.refresh')}</button>
        </div>
      </SalesScreen>
    )
  }

  const isLive = !error && displayData?.dataSource === 'live'

  return (
    <SalesScreen title="Sales Dashboard" subtitle="Overview for sales personnel — leads, pipeline, and targets">
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
          <Link to="lead-assignment-scoring">Lead Assignment</Link>
          <Link to="performance-metrics">Performance</Link>
          <Link to="commission-tracker">Commission</Link>
          <Link to="target-achievement-tracker">Targets</Link>
        </nav>
        <div className="sales-kpis">
          <div className="sales-kpi-card">
            <h3>My leads</h3>
            <p className="sales-kpi-value">{displayData?.myLeads ?? 0}</p>
          </div>
          <div className="sales-kpi-card">
            <h3>Hot prospects</h3>
            <p className="sales-kpi-value">{displayData?.hotProspects ?? 0}</p>
          </div>
          <div className="sales-kpi-card">
            <h3>Follow-ups due</h3>
            <p className="sales-kpi-value">{displayData?.followUpsDue ?? 0}</p>
          </div>
          <div className="sales-kpi-card">
            <h3>Pipeline value</h3>
            <p className="sales-kpi-value">${(displayData?.pipelineValue ?? 0).toLocaleString()}</p>
          </div>
          <div className="sales-kpi-card">
            <h3>Deals in progress</h3>
            <p className="sales-kpi-value">{displayData?.dealsInProgress ?? 0}</p>
          </div>
          <div className="sales-kpi-card">
            <h3>Target %</h3>
            <p className="sales-kpi-value">{(displayData?.targetPercent ?? 0).toFixed(1)}%</p>
          </div>
          <div className="sales-kpi-card">
            <h3>Commission earned</h3>
            <p className="sales-kpi-value">${(displayData?.commissionEarned ?? 0).toLocaleString()}</p>
          </div>
          <div className="sales-kpi-card">
            <h3>Commission pending</h3>
            <p className="sales-kpi-value">${(displayData?.commissionPending ?? 0).toLocaleString()}</p>
          </div>
        </div>
        <div className="card-grid">
          <div className="card">
            <h3>Monthly target vs achieved</h3>
            <p>Target: ${(displayData?.monthlyTarget ?? 0).toLocaleString()} · Achieved: ${(displayData?.monthlyAchieved ?? 0).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </SalesScreen>
  )
}
