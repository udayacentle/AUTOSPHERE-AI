import { useState, useCallback, useEffect } from 'react'
import TechnicianScreen from './TechnicianScreen'
import {
  api,
  type VehicleDiagnosticTwinData,
  type VehicleDiagnosticTwinListItem,
  type DiagnosticCodeItem,
  type DiagnosticSensorReading,
  type DiagnosticServiceRecord,
} from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import './VehicleDiagnosticDigitalTwin.css'

const COMPONENT_LABELS: Record<string, string> = {
  engine: 'Engine',
  battery: 'Battery',
  brakesTires: 'Brakes & Tires',
  fluids: 'Fluids',
  electrical: 'Electrical',
}

function healthClass(score: number): string {
  if (score >= 85) return 'diagnostic-twin-health--good'
  if (score >= 65) return 'diagnostic-twin-health--fair'
  return 'diagnostic-twin-health--low'
}

function severityClass(severity: string): string {
  if (severity === 'critical') return 'diagnostic-twin-code--critical'
  if (severity === 'warning') return 'diagnostic-twin-code--warning'
  return 'diagnostic-twin-code--info'
}

function sensorStatusClass(status: string): string {
  if (status === 'critical') return 'diagnostic-twin-sensor--critical'
  if (status === 'warning') return 'diagnostic-twin-sensor--warning'
  return 'diagnostic-twin-sensor--normal'
}

function formatDate(d: string): string {
  try {
    return new Date(d).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return d
  }
}

const FALLBACK_TWIN: VehicleDiagnosticTwinData = {
  vehicleId: 'v1',
  vin: '4T1BF1FK5NU123456',
  plateNumber: 'AB-1234',
  make: 'Toyota',
  model: 'Camry',
  year: 2024,
  odometerKm: 18420,
  healthScore: 87,
  health: { engine: 90, battery: 85, brakesTires: 88, fluids: 82, electrical: 92 },
  diagnosticCodes: [
    { code: 'P0420', type: 'OBD2', description: 'Catalyst system efficiency below threshold (Bank 1)', severity: 'warning', status: 'active', firstSeenAt: new Date().toISOString(), relatedRepairId: null },
    { code: 'P0171', type: 'OBD2', description: 'System too lean (Bank 1)', severity: 'warning', status: 'active', firstSeenAt: new Date().toISOString(), relatedRepairId: null },
  ],
  sensorData: [
    { name: 'Engine RPM', value: 720, unit: 'rpm', status: 'normal', readAt: new Date().toISOString() },
    { name: 'Coolant temp', value: 92, unit: '°C', status: 'normal', readAt: new Date().toISOString() },
    { name: 'MAF', value: 4.2, unit: 'g/s', status: 'normal', readAt: new Date().toISOString() },
    { name: 'O2 sensor (Bank 1)', value: 0.45, unit: 'V', status: 'warning', readAt: new Date().toISOString() },
    { name: 'Battery voltage', value: 12.4, unit: 'V', status: 'normal', readAt: new Date().toISOString() },
    { name: 'Tire pressure FL', value: 218, unit: 'kPa', status: 'normal', readAt: new Date().toISOString() },
    { name: 'Tire pressure FR', value: 215, unit: 'kPa', status: 'normal', readAt: new Date().toISOString() },
    { name: 'Tire pressure RL', value: 220, unit: 'kPa', status: 'normal', readAt: new Date().toISOString() },
    { name: 'Tire pressure RR', value: 219, unit: 'kPa', status: 'normal', readAt: new Date().toISOString() },
  ],
  serviceHistory: [
    { date: '2025-01-15', type: 'Oil Change', description: 'Full synthetic oil and filter', mileageKm: 17200, partsReplaced: ['Oil filter', 'Engine oil 5W-30'], cost: 85, provider: 'QuickLube' },
    { date: '2024-10-20', type: 'Brake Inspection', description: 'Brake pads and rotor check', mileageKm: 15200, partsReplaced: [], cost: 45, provider: 'AutoCare' },
    { date: '2024-07-12', type: 'Tire Rotation', description: 'Rotate and balance', mileageKm: 12800, partsReplaced: [], cost: 35, provider: 'TirePlus' },
  ],
  lastScanAt: new Date().toISOString(),
}

const FALLBACK_LIST: VehicleDiagnosticTwinListItem[] = [
  { vehicleId: 'v1', plateNumber: 'AB-1234', make: 'Toyota', model: 'Camry', year: 2024, healthScore: 87 },
  { vehicleId: 'v2', plateNumber: 'CD-5678', make: 'Mercedes-Benz', model: 'Sprinter', year: 2023, healthScore: 78 },
  { vehicleId: 'v3', plateNumber: 'EF-9012', make: 'Toyota', model: 'Hiace', year: 2022, healthScore: 72 },
]

export default function VehicleDiagnosticDigitalTwin() {
  const { t } = useI18n()
  const [selectedPlate, setSelectedPlate] = useState<string | null>(null)

  const { data: listData, loading: listLoading } = useApiData<VehicleDiagnosticTwinListItem[] | null>(() =>
    api.getDiagnosticTwinList()
  )
  const list = Array.isArray(listData) && listData.length > 0 ? listData : FALLBACK_LIST

  const fetchTwin = useCallback(() => {
    if (selectedPlate) return api.getDiagnosticTwin({ plate: selectedPlate })
    return api.getDiagnosticTwin()
  }, [selectedPlate])

  const { data: twinData, loading: twinLoading, error, refetch } = useApiData<VehicleDiagnosticTwinData | null>(fetchTwin)
  const twin = twinData ?? (error ? FALLBACK_TWIN : null)

  useEffect(() => {
    refetch()
  }, [selectedPlate])

  const [scanning, setScanning] = useState(false)
  const handleRunScan = async () => {
    setScanning(true)
    try {
      await api.runDiagnosticScan({ plateNumber: selectedPlate || undefined, vin: twin?.vin })
      await refetch()
    } catch (e) {
      console.error(e)
    } finally {
      setScanning(false)
    }
  }

  const loading = listLoading || twinLoading
  const vehicleLabel = twin
    ? `${twin.make} ${twin.model} (${twin.year}) · ${twin.plateNumber}`
    : '—'

  return (
    <TechnicianScreen
      title="Vehicle Diagnostic Digital Twin"
      subtitle="3D and diagnostic view: component health, fault codes, sensor data, service history"
    >
      <div className="diagnostic-twin-page">
        <div className="diagnostic-twin-toolbar">
          <label className="diagnostic-twin-select-label">
            Vehicle
            <select
              className="diagnostic-twin-select"
              value={selectedPlate ?? ''}
              onChange={(e) => setSelectedPlate(e.target.value || null)}
              disabled={listLoading}
            >
              <option value="">Default (first vehicle)</option>
              {list.map((v) => (
                <option key={v.plateNumber} value={v.plateNumber}>
                  {v.plateNumber} · {v.make} {v.model} ({v.year}) — {v.healthScore}%
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="btn-refresh diagnostic-twin-scan-btn"
            onClick={handleRunScan}
            disabled={scanning || loading}
          >
            {scanning ? 'Scanning…' : 'Run diagnostic scan'}
          </button>
          <button type="button" className="btn-refresh" onClick={() => refetch()} disabled={loading}>
            {t('common.refresh')}
          </button>
        </div>

        {loading && !twin && (
          <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
        )}

        {error && (
          <div className="diagnostic-twin-offline-banner" style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(255, 193, 7, 0.15)', border: '1px solid rgba(255, 193, 7, 0.4)', borderRadius: 8, color: '#856404', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span>Showing sample data. Backend not connected — start it with &quot;npm start&quot; in <code>autosphere_full_production_monorepo/services/backend</code> for live data.</span>
            <button type="button" className="btn-refresh" onClick={() => refetch()}>Retry</button>
          </div>
        )}

        {twin && (
          <>
            {/* Digital twin summary */}
            <section className="card diagnostic-twin-summary">
              <h2 className="diagnostic-twin-section-title">Digital twin</h2>
              <div className="diagnostic-twin-hero">
                <div className="diagnostic-twin-visual" aria-hidden>
                  <span className="diagnostic-twin-car-icon" role="img" aria-label="Vehicle">🚗</span>
                </div>
                <div className="diagnostic-twin-meta">
                  <h3>{vehicleLabel}</h3>
                  <p className="diagnostic-twin-vin">VIN: {twin.vin}</p>
                  <p className="diagnostic-twin-odo">Odometer: {twin.odometerKm.toLocaleString()} km</p>
                  <p className="diagnostic-twin-scan">Last scan: {formatDate(twin.lastScanAt)}</p>
                  <div className={`diagnostic-twin-overall ${healthClass(twin.healthScore)}`}>
                    Overall health: <strong>{twin.healthScore}%</strong>
                  </div>
                </div>
              </div>
              <div className="diagnostic-twin-components">
                {Object.entries(twin.health).map(([key, score]) => (
                  <div key={key} className="diagnostic-twin-component">
                    <span className="diagnostic-twin-component-label">{COMPONENT_LABELS[key] ?? key}</span>
                    <div className="diagnostic-twin-component-bar-wrap">
                      <div
                        className={`diagnostic-twin-component-bar ${healthClass(score)}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className="diagnostic-twin-component-value">{score}%</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Diagnostic codes (OBD / OEM) */}
            <section className="card diagnostic-twin-codes">
              <h2 className="diagnostic-twin-section-title">Diagnostic codes (OBD / OEM)</h2>
              {twin.diagnosticCodes && twin.diagnosticCodes.length > 0 ? (
                <div className="diagnostic-twin-table-wrap">
                  <table className="diagnostic-twin-table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Severity</th>
                        <th>Status</th>
                        <th>First seen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {twin.diagnosticCodes.map((c: DiagnosticCodeItem, i: number) => (
                        <tr key={`${c.code}-${i}`} className={severityClass(c.severity)}>
                          <td><code>{c.code}</code></td>
                          <td>{c.type}</td>
                          <td>{c.description}</td>
                          <td>{c.severity}</td>
                          <td>{c.status}</td>
                          <td>{formatDate(c.firstSeenAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="diagnostic-twin-empty">No active diagnostic codes.</p>
              )}
            </section>

            {/* Live sensor data */}
            <section className="card diagnostic-twin-sensors">
              <h2 className="diagnostic-twin-section-title">Live sensor data</h2>
              {twin.sensorData && twin.sensorData.length > 0 ? (
                <div className="diagnostic-twin-sensor-grid">
                  {twin.sensorData.map((s: DiagnosticSensorReading, i: number) => (
                    <div key={`${s.name}-${i}`} className={`diagnostic-twin-sensor-card ${sensorStatusClass(s.status)}`}>
                      <span className="diagnostic-twin-sensor-name">{s.name}</span>
                      <span className="diagnostic-twin-sensor-value">
                        {typeof s.value === 'number' ? s.value.toLocaleString() : s.value} {s.unit}
                      </span>
                      <span className="diagnostic-twin-sensor-status">{s.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="diagnostic-twin-empty">No sensor data available.</p>
              )}
            </section>

            {/* Service history */}
            <section className="card diagnostic-twin-service">
              <h2 className="diagnostic-twin-section-title">Service history</h2>
              {twin.serviceHistory && twin.serviceHistory.length > 0 ? (
                <div className="diagnostic-twin-table-wrap">
                  <table className="diagnostic-twin-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Mileage (km)</th>
                        <th>Parts</th>
                        <th>Cost</th>
                        <th>Provider</th>
                      </tr>
                    </thead>
                    <tbody>
                      {twin.serviceHistory.map((s: DiagnosticServiceRecord, i: number) => (
                        <tr key={`${s.date}-${s.type}-${i}`}>
                          <td>{s.date}</td>
                          <td>{s.type}</td>
                          <td>{s.description}</td>
                          <td>{s.mileageKm != null ? s.mileageKm.toLocaleString() : '—'}</td>
                          <td>{s.partsReplaced?.length ? s.partsReplaced.join(', ') : '—'}</td>
                          <td>{s.cost != null ? `$${s.cost}` : '—'}</td>
                          <td>{s.provider || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="diagnostic-twin-empty">No service history recorded.</p>
              )}
            </section>
          </>
        )}
      </div>
    </TechnicianScreen>
  )
}
