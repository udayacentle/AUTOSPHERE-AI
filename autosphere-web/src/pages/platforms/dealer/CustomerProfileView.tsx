import { Link } from 'react-router-dom'
import DealerScreen from './DealerScreen'
import { api, type DealerCustomersData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_DEALER_CUSTOMERS } from './dealerFallbackData'
import './DealerSection.css'

function formatDate(s: string) {
  try { return new Date(s).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) } catch { return s }
}

export default function CustomerProfileView() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<DealerCustomersData>(() => api.getDealerCustomers())
  const displayData = (data != null && typeof data === 'object') ? data : (error ? FALLBACK_DEALER_CUSTOMERS : null)
  const customers = displayData?.customers ?? []

  if (loading && !displayData) {
    return (
      <DealerScreen title="Customer Profile View" subtitle="Customer list and lifetime value">
        <p className="dealer-loading">{t('common.loading')}</p>
      </DealerScreen>
    )
  }
  if (!displayData) {
    return (
      <DealerScreen title="Customer Profile View" subtitle="Customer list and lifetime value">
        <div className="dealer-error">
          <p>Could not load customers.</p>
          <button type="button" className="dealer-btn" onClick={() => refetch()}>{t('common.refresh')}</button>
        </div>
      </DealerScreen>
    )
  }

  const isLive = !error && displayData?.dataSource === 'live'

  return (
    <DealerScreen title="Customer Profile View" subtitle="Customer list and lifetime value">
      <div className="dealer-page">
        <div className="dealer-toolbar">
          <span className={`dealer-badge ${isLive ? 'dealer-badge-live' : 'dealer-badge-sample'}`}>{isLive ? 'Live data' : 'Sample data'}</span>
          {displayData?.lastUpdated && <span className="dealer-meta">Last updated: {formatDate(displayData.lastUpdated)}</span>}
          <button type="button" className="dealer-btn" onClick={() => refetch()}>{t('common.refresh')}</button>
        </div>
        {error && (
          <div className="dealer-sample-banner">
            <span>{t('common.sampleDataBanner')}</span>
            <button type="button" className="dealer-btn" onClick={() => refetch()}>{t('common.refresh')}</button>
          </div>
        )}
        <nav className="dealer-quick-links">
          <Link to="lead-management">Leads</Link>
          <Link to="sales-funnel">Sales Funnel</Link>
        </nav>
        <div className="dealer-kpis">
          <div className="dealer-kpi-card">
            <h3>Total customers</h3>
            <p className="dealer-kpi-value">{customers.length}</p>
          </div>
        </div>
        <section className="dealer-section">
          <h3>Customers</h3>
          <p className="dealer-desc">Vehicles owned, last visit, lifetime value.</p>
          <div className="dealer-table-wrap">
            <table className="dealer-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Vehicles</th>
                  <th>Last visit</th>
                  <th>Lifetime value</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong></td>
                    <td>{c.email}</td>
                    <td>{c.vehiclesOwned}</td>
                    <td>{c.lastVisit}</td>
                    <td>${c.lifetimeValue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {customers.length === 0 && <p className="dealer-empty">No customers.</p>}
        </section>
      </div>
    </DealerScreen>
  )
}
