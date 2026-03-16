import DriverScreen from './DriverScreen'
import { api, type ServiceHistoryItem } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'

const FALLBACK_SERVICE_HISTORY: ServiceHistoryItem[] = [
  { date: '2025-03-15', type: 'Oil Change', description: 'Regular oil and filter', status: 'completed', cost: 85 },
  { date: '2025-02-10', type: 'Tire Rotation', description: 'Rotate and balance', status: 'completed', cost: 60 },
  { date: '2025-01-05', type: 'Brake Inspection', description: 'Brake pad check', status: 'completed', cost: 0 },
]

export default function ServiceHistory() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<ServiceHistoryItem[] | null>(() =>
    api.getServiceHistory()
  )
  const history = Array.isArray(data) ? data : (error ? FALLBACK_SERVICE_HISTORY : [])

  if (loading) {
    return (
      <DriverScreen title="Service History Timeline" subtitle="Past services and repairs">
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </DriverScreen>
    )
  }

  return (
    <DriverScreen title="Service History Timeline" subtitle="Past services and repairs">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
      {error && (
        <p style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: 8 }}>
          {t('fleet.showingSampleData')}
        </p>
      )}
      <ul className="screen-list">
        {history.map((item, i) => (
          <li key={i}>
            <span>
              <strong>{item.type}</strong> – {item.date}
              {item.description ? ` · ${item.description}` : ''}
              {item.status ? ` · ${item.status}` : ''}
              {item.cost != null ? ` · $${item.cost}` : ''}
            </span>
          </li>
        ))}
      </ul>
      {history.length === 0 && (
        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          No service records yet.
        </p>
      )}
    </DriverScreen>
  )
}
