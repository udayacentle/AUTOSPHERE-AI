import { Link } from 'react-router-dom'
import DealerScreen from './DealerScreen'
import { api, type DealerInventoryItem } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_DEALER_INVENTORY } from './dealerFallbackData'
import './DealerSection.css'

export default function DigitalTwinInventoryView() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<DealerInventoryItem[]>(() => api.getDealerInventory())
  const inventory = (data != null && Array.isArray(data)) ? data : (error ? FALLBACK_DEALER_INVENTORY : [])

  if (loading && inventory.length === 0 && !error) {
    return (
      <DealerScreen title="Digital Twin Inventory View" subtitle="Visualize inventory with vehicle digital twins">
        <p className="dealer-loading">{t('common.loading')}</p>
      </DealerScreen>
    )
  }

  return (
    <DealerScreen title="Digital Twin Inventory View" subtitle="Visualize inventory with vehicle digital twins">
      <div className="dealer-page">
        {error && (
          <div className="dealer-sample-banner">
            <span>{t('common.sampleDataBanner')}</span>
            <button type="button" className="dealer-btn" onClick={() => refetch()}>{t('common.refresh')}</button>
          </div>
        )}
        <nav className="dealer-quick-links">
          <Link to="inventory-management">Inventory list</Link>
          <Link to="dynamic-pricing-engine">Pricing</Link>
        </nav>
        <section className="dealer-section">
          <h3>Bulk view</h3>
          <p className="dealer-desc">Grid of all vehicles with twin status. Click vehicle for full digital twin details.</p>
          <div className="dealer-twin-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {inventory.map((v) => (
              <div key={v.id} className="dealer-twin-card" style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 12, background: 'var(--surface)' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>🚗</div>
                <strong>{v.make} {v.model}</strong>
                <p style={{ margin: '4px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{v.year} · ${v.price?.toLocaleString?.() ?? v.price}</p>
                <span className={`dealer-status dealer-status-${(v.status || 'available').toLowerCase()}`} style={{ fontSize: '0.8rem' }}>{v.status || 'available'}</span>
                {v.plateNumber && <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{v.plateNumber}</p>}
              </div>
            ))}
          </div>
          {inventory.length === 0 && <p className="dealer-empty">No vehicles in inventory.</p>}
        </section>
      </div>
    </DealerScreen>
  )
}
