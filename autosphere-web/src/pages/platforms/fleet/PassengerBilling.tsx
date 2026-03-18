import { useState, useEffect } from 'react'
import { useI18n } from '../../../i18n/context'
import { api, type FleetPassengerBillingData } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import FleetScreen from './FleetScreen'
import './FleetBrd.css'

export default function PassengerBilling() {
  const { t } = useI18n()
  const [pid, setPid] = useState('user-passenger-1')
  const { data, loading, error, refetch } = useApiData<FleetPassengerBillingData | null>(() =>
    api.getFleetPassengerBilling(pid)
  )

  useEffect(() => {
    refetch()
  }, [pid])

  return (
    <FleetScreen title={t('fleet.brdBillingTitle')} subtitle={t('fleet.brdBillingSubtitle')}>
      <div className="fleet-brd-toolbar">
        <label>
          Passenger{' '}
          <select value={pid} onChange={(e) => setPid(e.target.value)}>
            <option value="user-passenger-1">Alex Rider</option>
            <option value="user-passenger-2">Sam Carter</option>
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
