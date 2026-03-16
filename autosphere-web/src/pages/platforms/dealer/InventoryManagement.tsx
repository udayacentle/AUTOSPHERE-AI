import DealerScreen from './DealerScreen'
import { api, type DealerInventoryItem } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'

export default function InventoryManagement() {
  const { t } = useI18n()
  const { data: inventory = [], loading, error, refetch } = useApiData<DealerInventoryItem[]>(() =>
    api.getDealerInventory()
  )

  if (loading) {
    return (
      <DealerScreen title="Inventory Management" subtitle="Manage vehicle stock and availability">
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </DealerScreen>
    )
  }
  if (error) {
    return (
      <DealerScreen title="Inventory Management" subtitle="Manage vehicle stock and availability">
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </DealerScreen>
    )
  }

  return (
    <DealerScreen title="Inventory Management" subtitle="Real inventory from backend">
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
