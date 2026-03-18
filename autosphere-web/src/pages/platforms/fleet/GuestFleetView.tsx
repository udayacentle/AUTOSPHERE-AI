import { useI18n } from '../../../i18n/context'
import { api, type FleetPublicVehiclesResponse } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import FleetScreen from './FleetScreen'
import './FleetBrd.css'

export default function GuestFleetView() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<FleetPublicVehiclesResponse | null>(() =>
    api.getFleetVehiclesPublic()
  )

  return (
    <FleetScreen title={t('fleet.brdGuestTitle')} subtitle={t('fleet.brdGuestSubtitle')}>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        {data?.notice || t('fleet.brdGuestNote')}
      </p>
      <button type="button" className="btn-refresh" style={{ marginBottom: '1rem' }} onClick={() => refetch()}>
        {t('common.refresh')}
      </button>
      {loading ? (
        <p>{t('common.loading')}</p>
      ) : (
        <section className="card fleet-brd-card">
          <table className="fleet-brd-table">
            <thead>
              <tr>
                <th>{t('fleet.vehicle') || 'Vehicle'}</th>
                <th>Plate</th>
                <th>{t('fleet.brdAvailability')}</th>
              </tr>
            </thead>
            <tbody>
              {(data?.vehicles || []).map((v) => (
                <tr key={v.plateNumber}>
                  <td>{v.model}</td>
                  <td>
                    <code>{v.plateNumber}</code>
                  </td>
                  <td>{v.availability}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
      {error && <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>{t('fleet.showingSampleData')}</p>}
    </FleetScreen>
  )
}
