import { useState, useEffect, useMemo } from 'react'
import { useI18n } from '../../../i18n/context'
import { api, type FleetPassengerBillingData, type FleetUserItem } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import FleetScreen from './FleetScreen'
import './FleetBrd.css'

const FALLBACK_PASSENGERS: Pick<FleetUserItem, 'userId' | 'fullName'>[] = [
  { userId: 'user-passenger-1', fullName: 'Alex Rider' },
  { userId: 'user-passenger-2', fullName: 'Sam Carter' },
]

export default function PassengerBilling() {
  const { t } = useI18n()
  const [pid, setPid] = useState('user-passenger-1')
  const { data: fleetUsers } = useApiData<FleetUserItem[]>(() => api.getFleetUsers(), { pollInterval: 0 })
  const { data, loading, error, refetch } = useApiData<FleetPassengerBillingData | null>(() =>
    api.getFleetPassengerBilling(pid)
  )

  const passengerOptions = useMemo(() => {
    const fromApi = (fleetUsers || []).filter((u) => u.roleSlug === 'passenger')
    return fromApi.length > 0 ? fromApi : FALLBACK_PASSENGERS
  }, [fleetUsers])

  useEffect(() => {
    refetch()
  }, [pid])

  useEffect(() => {
    if (!passengerOptions.some((p) => p.userId === pid) && passengerOptions[0]) {
      setPid(passengerOptions[0].userId)
    }
  }, [passengerOptions, pid])

  return (
    <FleetScreen title={t('fleet.brdBillingTitle')} subtitle={t('fleet.brdBillingSubtitle')}>
      <div className="fleet-brd-toolbar">
        <label>
          {t('fleet.brdPassengerSelect')}{' '}
          <select value={pid} onChange={(e) => setPid(e.target.value)}>
            {passengerOptions.map((p) => (
              <option key={p.userId} value={p.userId}>
                {p.fullName || p.userId}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>
          {t('common.refresh')}
        </button>
      </div>
      {loading ? (
        <p>{t('common.loading')}</p>
      ) : !data ? (
        <p>{t('fleet.noData')}</p>
      ) : (
        <section className="card fleet-brd-card">
          {error && <p className="fleet-offline-banner" style={{ padding: '0.75rem', borderRadius: 8 }}>{t('fleet.showingSampleData')}</p>}
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {t('fleet.brdBillingBalance')}: <strong>{data.currency}</strong> {data.balanceDue?.toFixed(2)}
          </p>
          <table className="fleet-brd-table" style={{ marginTop: '1rem' }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(data.lines || []).map((row) => (
                <tr key={row.id}>
                  <td>{row.date}</td>
                  <td>{row.description}</td>
                  <td>{row.amount?.toFixed(2)}</td>
                  <td>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </FleetScreen>
  )
}
