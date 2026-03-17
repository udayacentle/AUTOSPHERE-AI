import DealerScreen from './DealerScreen'
import { api, type DealerInventoryItem } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import { FALLBACK_DEALER_INVENTORY } from './dealerFallbackData'

export default function InventoryManagement() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<DealerInventoryItem[]>(() =>
    api.getDealerInventory()
  )
  const inventory = (data != null && Array.isArray(data)) ? data : (error ? FALLBACK_DEALER_INVENTORY : [])

  if (loading && inventory.length === 0 && !error) {
    return (
      <DealerScreen title="Inventory Management" subtitle="Manage vehicle stock and availability">
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </DealerScreen>
    )
  }

  return (
    <DealerScreen title="Inventory Management" subtitle="Manage vehicle stock and availability">
      {error && (
        <div style={{ marginBottom: '1rem', padding: '0.6rem 1rem', background: 'rgba(255,193,7,0.15)', borderRadius: 8, color: '#856404', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span>{t('common.sampleDataBanner')}</span>
          <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
      <div className="card-grid">
        <div className="card">
          <h3>Total vehicles</h3>
          <p><strong>{inventory.length}</strong></p>
        </div>
        <div className="card">
          <h3>Available</h3>
          <p><strong>{inventory.filter((v) => v.status === 'available').length}</strong></p>
        </div>
      </div>
      <section className="card" style={{ marginTop: '1rem' }}>
        <h3>Vehicle list</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {inventory.map((v) => (
            <li key={v.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <strong>{v.make} {v.model}</strong> ({v.year}) · {v.status} · ${v.price.toLocaleString()}
              {v.plateNumber && <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}> · {v.plateNumber}</span>}
            </li>
          ))}
        </ul>
        {inventory.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No vehicles in inventory.</p>}
      </section>
    </DealerScreen>
  )
}
