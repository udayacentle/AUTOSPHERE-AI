import DriverScreen from './DriverScreen'
import {
  api,
  type DriverFuelCarbonData,
  type RefuelLogItem,
} from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import './FuelTracker.css'

const FALLBACK_DATA: DriverFuelCarbonData = {
  weather: { temp: 18, description: 'Clear', code: 0 },
  fuelEfficiency: {
    totalDistanceKm: 428,
    estimatedLiters: 35.7,
    avgKmPerL: 12,
    totalTrips: 12,
    period: new Date().toLocaleString(undefined, { month: 'long', year: 'numeric' }),
  },
  carbon: {
    totalKgCO2: 42,
    petrolKgCO2: 31,
    dieselKgCO2: 9,
    electricKgCO2: 2,
    totalDistanceKm: 428,
    period: new Date().toLocaleString(undefined, { month: 'long', year: 'numeric' }),
  },
  refuelLog: [
    { id: 'rf-1', date: '2025-03-10', amountLiters: 42, cost: 168, odometerKm: 18200, fuelType: 'Gasoline' },
    { id: 'rf-2', date: '2025-02-28', amountLiters: 38, cost: 152, odometerKm: 17700, fuelType: 'Gasoline' },
  ],
  lastUpdated: new Date().toISOString(),
}

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString(undefined, { dateStyle: 'short' })
  } catch {
    return d
  }
}

export default function FuelTracker() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<DriverFuelCarbonData | null>(() =>
    api.getDriverFuelCarbon(37.77, -122.41)
  )
  const fc = data ?? (error ? FALLBACK_DATA : null)

  if (loading) {
    return (
      <DriverScreen title={t('fuelTracker.title')} subtitle={t('fuelTracker.subtitle')}>
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </DriverScreen>
    )
  }
  if (!fc) {
    return (
      <DriverScreen title={t('fuelTracker.title')} subtitle={t('fuelTracker.subtitle')}>
        <p style={{ color: 'var(--danger)' }}>{error ?? t('fuelTracker.unableToLoad')}</p>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>
          {t('common.refresh')}
        </button>
      </DriverScreen>
    )
  }

  const { weather, fuelEfficiency, carbon, refuelLog, lastUpdated } = fc

  return (
    <DriverScreen title={t('fuelTracker.title')} subtitle={t('fuelTracker.subtitle')}>
      <div className="fuel-tracker-page">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button type="button" className="btn-refresh" onClick={() => refetch()}>
            {t('common.refresh')}
          </button>
        </div>

        <div className="fuel-tracker-summary">
          <div className="fuel-tracker-card">
            <h3>{t('fuelTracker.weather')}</h3>
            <div className="value">
              {weather.temp != null ? `${weather.temp} °C` : '—'} · {weather.description}
            </div>
            <div className="sub fuel-tracker-weather-source">{t('fuelTracker.weatherSource')}</div>
          </div>
          <div className="fuel-tracker-card">
            <h3>{t('fuelTracker.distance')}</h3>
            <div className="value">{fuelEfficiency.totalDistanceKm.toLocaleString()} km</div>
            <div className="sub">{fuelEfficiency.period} · {fuelEfficiency.totalTrips} {t('fuelTracker.trips')}</div>
          </div>
          <div className="fuel-tracker-card">
            <h3>{t('fuelTracker.efficiency')}</h3>
            <div className="value">{fuelEfficiency.avgKmPerL} km/L</div>
            <div className="sub">~{fuelEfficiency.estimatedLiters} L {t('fuelTracker.estimated')}</div>
          </div>
          <div className="fuel-tracker-card">
            <h3>{t('fuelTracker.carbonFootprint')}</h3>
            <div className="value">{carbon.totalKgCO2} kg CO₂</div>
            <div className="sub fuel-tracker-carbon-breakdown">
              <span>Petrol: {carbon.petrolKgCO2} kg</span>
              <span>Diesel: {carbon.dieselKgCO2} kg</span>
              <span>Electric: {carbon.electricKgCO2} kg</span>
            </div>
          </div>
        </div>

        <section className="card">
          <h3>{t('fuelTracker.refuelLog')}</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            {t('fuelTracker.refuelLogDesc')}
          </p>
          {refuelLog.length === 0 ? (
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t('fuelTracker.noRefuels')}</p>
          ) : (
            <div className="fuel-tracker-refuel-table-wrap">
              <table className="fuel-tracker-refuel-table">
                <thead>
                  <tr>
                    <th>{t('fuelTracker.date')}</th>
                    <th>{t('fuelTracker.amount')}</th>
                    <th>{t('fuelTracker.cost')}</th>
                    <th>{t('fuelTracker.odometer')}</th>
                    <th>{t('fuelTracker.fuelType')}</th>
                  </tr>
                </thead>
                <tbody>
                  {refuelLog.map((r: RefuelLogItem) => (
                    <tr key={r.id}>
                      <td>{formatDate(r.date)}</td>
                      <td>{r.amountLiters} L</td>
                      <td>${r.cost.toFixed(2)}</td>
                      <td>{r.odometerKm.toLocaleString()} km</td>
                      <td>{r.fuelType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          {t('fuelTracker.carbonNote')}
        </p>

        <p className="fuel-tracker-updated">
          {t('fuelTracker.lastUpdated')}: {formatDate(lastUpdated)}
        </p>
      </div>
    </DriverScreen>
  )
}
