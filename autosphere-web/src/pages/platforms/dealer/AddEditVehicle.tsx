import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import DealerScreen from './DealerScreen'
import { api, type DealerInventoryItem } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import './DealerSection.css'

export default function AddEditVehicle() {
  const { t } = useI18n()
  const [searchParams, setSearchParams] = useSearchParams()
  const vehicleId = searchParams.get('id') ?? ''
  const { data: inventoryData, loading, error, refetch } = useApiData<DealerInventoryItem[]>(() =>
    api.getDealerInventory()
  )
  const inventory = useMemo(() => (Array.isArray(inventoryData) ? inventoryData : []), [inventoryData])
  const selectedVehicle = useMemo(() => inventory.find((item) => item.id === vehicleId) ?? null, [inventory, vehicleId])
  const [form, setForm] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    status: 'available',
    plateNumber: '',
    notes: '',
  })
  const [saveState, setSaveState] = useState<{ saving: boolean; message: string | null; isError: boolean }>({
    saving: false,
    message: null,
    isError: false,
  })

  useEffect(() => {
    if (selectedVehicle) {
      setForm({
        make: selectedVehicle.make ?? '',
        model: selectedVehicle.model ?? '',
        year: selectedVehicle.year ?? new Date().getFullYear(),
        price: selectedVehicle.price ?? 0,
        status: selectedVehicle.status ?? 'available',
        plateNumber: selectedVehicle.plateNumber ?? '',
        notes: selectedVehicle.notes ?? '',
      })
    }
  }, [selectedVehicle])

  const displayVehicle = selectedVehicle ?? null

  async function onSave() {
    setSaveState({ saving: true, message: null, isError: false })
    try {
      const result = await api.saveDealerVehicle({
        id: displayVehicle?.id,
        ...form,
      })
      setSaveState({
        saving: false,
        message: result.success ? `Vehicle ${displayVehicle ? 'updated' : 'created'} successfully.` : 'Save failed',
        isError: !result.success,
      })
      await refetch()
      if (!displayVehicle && result.vehicle?.id) {
        setSearchParams({ id: result.vehicle.id })
      }
    } catch (err) {
      setSaveState({ saving: false, message: err instanceof Error ? err.message : 'Save failed', isError: true })
    }
  }

  const title = displayVehicle ? 'Edit Vehicle' : 'Add Vehicle'
  const subtitle = displayVehicle ? 'Update an existing inventory listing' : 'Create a new inventory listing'

  if (loading && inventory.length === 0 && !error) {
    return (
      <DealerScreen title={title} subtitle={subtitle}>
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </DealerScreen>
    )
  }

  return (
    <DealerScreen title={title} subtitle={subtitle}>
      <div className="dealer-page">
        <nav className="dealer-quick-links">
          <Link to="inventory-management">View inventory</Link>
          <Link to="digital-twin-inventory-view">Digital twin view</Link>
        </nav>
        {error && (
          <div className="dealer-sample-banner">
            <span>{t('common.sampleDataBanner')}</span>
            <button type="button" className="dealer-btn" onClick={() => refetch()}>{t('common.refresh')}</button>
          </div>
        )}
        <div className="dealer-section">
          <h3>Vehicle selector</h3>
          <p className="dealer-desc">Choose a vehicle to edit or start a new listing.</p>
          <div className="dealer-filters">
            <button
              type="button"
              className={`dealer-filter-btn ${!vehicleId ? 'active' : ''}`}
              onClick={() => setSearchParams({})}
            >
              New vehicle
            </button>
            {inventory.slice(0, 6).map((item) => (
              <button
                key={item.id}
                type="button"
                className={`dealer-filter-btn ${vehicleId === item.id ? 'active' : ''}`}
                onClick={() => setSearchParams({ id: item.id })}
              >
                {item.make} {item.model}
              </button>
            ))}
          </div>
        </div>

        <div className="card-grid">
          <div className="card">
            <h3>Vehicle details</h3>
            <div className="dealer-form-grid">
              <label>
                Make
                <input value={form.make} onChange={(e) => setForm((p) => ({ ...p, make: e.target.value }))} />
              </label>
              <label>
                Model
                <input value={form.model} onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))} />
              </label>
              <label>
                Year
                <input type="number" value={form.year} onChange={(e) => setForm((p) => ({ ...p, year: Number(e.target.value) }))} />
              </label>
              <label>
                Plate number
                <input value={form.plateNumber} onChange={(e) => setForm((p) => ({ ...p, plateNumber: e.target.value }))} />
              </label>
            </div>
          </div>
          <div className="card">
            <h3>Pricing & status</h3>
            <div className="dealer-form-grid">
              <label>
                List price
                <input type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))} />
              </label>
              <label>
                Status
                <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                  <option value="available">Available</option>
                  <option value="service">Service</option>
                  <option value="sold">Sold</option>
                  <option value="reserved">Reserved</option>
                </select>
              </label>
              <label style={{ gridColumn: '1 / -1' }}>
                Notes
                <textarea rows={4} value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
              </label>
            </div>
          </div>
          <div className="card">
            <h3>Actions</h3>
            <p>Save the vehicle to the dealer inventory and update the shared inventory views.</p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button type="button" className="btn-refresh" onClick={onSave} disabled={saveState.saving}>
                {saveState.saving ? 'Saving...' : displayVehicle ? 'Update vehicle' : 'Create vehicle'}
              </button>
              <button
                type="button"
                className="btn-refresh"
                onClick={() => {
                  setSearchParams({})
                  setForm({
                    make: '',
                    model: '',
                    year: new Date().getFullYear(),
                    price: 0,
                    status: 'available',
                    plateNumber: '',
                    notes: '',
                  })
                }}
              >
                Reset
              </button>
            </div>
            {saveState.message && (
              <p style={{ color: saveState.isError ? 'var(--danger)' : 'var(--success)', marginTop: '0.75rem' }}>
                {saveState.message}
              </p>
            )}
          </div>
        </div>

        <div className="dealer-section">
          <h3>Linked inventory</h3>
          <p className="dealer-desc">These records come from the live inventory API and stay in sync after saves.</p>
          <div className="dealer-table-wrap">
            <table className="dealer-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Plate</th>
                  <th>Year</th>
                  <th>Status</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id}>
                    <td>{item.make} {item.model}</td>
                    <td>{item.plateNumber ?? '—'}</td>
                    <td>{item.year}</td>
                    <td>{item.status}</td>
                    <td>${item.price.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {inventory.length === 0 && <p className="dealer-empty">No vehicles in inventory.</p>}
        </div>
      </div>
    </DealerScreen>
  )
}
