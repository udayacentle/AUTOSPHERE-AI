import { useState } from 'react'
import DriverScreen from './DriverScreen'
import {
  api,
  type DriverInsuranceOverviewData,
  type InsuranceCoverageBreakdownItem,
  type InsurancePremiumEstimateResult,
} from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import { useI18n } from '../../../i18n/context'
import './InsuranceOverview.css'

const FALLBACK_OVERVIEW: DriverInsuranceOverviewData = {
  policy: {
    provider: 'State Farm',
    policyNumber: 'POL-2024-45678',
    expiryDate: '2025-09-15',
    premium: 1240,
    coverage: 'Comprehensive',
  },
  coverageBreakdown: [
    { name: 'Liability (Bodily Injury)', limit: '100/300k', premiumPortion: 420 },
    { name: 'Property Damage', limit: '50k', premiumPortion: 280 },
    { name: 'Collision', limit: 'Actual cash value', premiumPortion: 320 },
    { name: 'Comprehensive', limit: 'Actual cash value', premiumPortion: 220 },
  ],
  calculatorRates: { baseLiability: 600, baseCollision: 400, baseComprehensive: 250, currency: 'USD', period: 'annual' },
  lastUpdated: new Date().toISOString(),
}

function formatDate(d: string) {
  return d ? new Date(d).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—'
}

export default function InsuranceOverview() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<DriverInsuranceOverviewData | null>(() =>
    api.getDriverInsuranceOverview()
  )
  const overview = data ?? (error ? FALLBACK_OVERVIEW : null)

  const [vehicleValue, setVehicleValue] = useState(25000)
  const [driverAge, setDriverAge] = useState(35)
  const [coverageType, setCoverageType] = useState<'liability' | 'collision' | 'comprehensive'>('comprehensive')
  const [estimate, setEstimate] = useState<InsurancePremiumEstimateResult | null>(null)
  const [calculating, setCalculating] = useState(false)

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCalculating(true)
    setEstimate(null)
    try {
      const result = await api.getDriverInsurancePremiumEstimate({
        vehicleValue,
        driverAge,
        coverageType,
      })
      setEstimate(result)
    } catch {
      setEstimate(null)
    } finally {
      setCalculating(false)
    }
  }

  if (loading) {
    return (
      <DriverScreen title={t('insuranceOverview.title')} subtitle={t('insuranceOverview.subtitle')}>
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </DriverScreen>
    )
  }
  if (!overview) {
    return (
      <DriverScreen title={t('insuranceOverview.title')} subtitle={t('insuranceOverview.subtitle')}>
        <p style={{ color: 'var(--danger)' }}>{error ?? t('insuranceOverview.unableToLoad')}</p>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>
          {t('common.refresh')}
        </button>
      </DriverScreen>
    )
  }

  const { policy, coverageBreakdown, lastUpdated } = overview

  return (
    <DriverScreen title={t('insuranceOverview.title')} subtitle={t('insuranceOverview.subtitle')}>
      <div className="insurance-overview-page">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button type="button" className="btn-refresh" onClick={() => refetch()}>
            {t('common.refresh')}
          </button>
        </div>

        <section className="card insurance-policy-card">
          <h3>{t('insuranceOverview.currentPolicy')}</h3>
          <p>
            {policy.provider} · {policy.coverage} · {t('insuranceOverview.expires')} {formatDate(policy.expiryDate)}
          </p>
          <p className="insurance-policy-meta">
            {t('insuranceOverview.policyNumber')} {policy.policyNumber} · ${policy.premium.toLocaleString()}/{t('insuranceOverview.perYear')}
          </p>
        </section>

        <section className="card">
          <h3>{t('insuranceOverview.coverageBreakdown')}</h3>
          <ul className="insurance-coverage-list">
            {coverageBreakdown.map((item: InsuranceCoverageBreakdownItem, i: number) => (
              <li key={i}>
                <span>
                  {item.name}
                  {item.limit && <span className="limit">({item.limit})</span>}
                </span>
                <span className="amount">${item.premiumPortion}/yr</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h3>{t('insuranceOverview.premiumCalculator')}</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            {t('insuranceOverview.calculatorDesc')}
          </p>
          <form onSubmit={handleCalculate} className="insurance-calculator-form">
            <div>
              <label htmlFor="vehicleValue">{t('insuranceOverview.vehicleValue')}</label>
              <input
                id="vehicleValue"
                type="number"
                min={5000}
                max={100000}
                step={1000}
                value={vehicleValue}
                onChange={(e) => setVehicleValue(Number(e.target.value) || 25000)}
              />
            </div>
            <div>
              <label htmlFor="driverAge">{t('insuranceOverview.driverAge')}</label>
              <input
                id="driverAge"
                type="number"
                min={18}
                max={80}
                value={driverAge}
                onChange={(e) => setDriverAge(Number(e.target.value) || 35)}
              />
            </div>
            <div>
              <label htmlFor="coverageType">{t('insuranceOverview.coverageType')}</label>
              <select
                id="coverageType"
                value={coverageType}
                onChange={(e) => setCoverageType(e.target.value as 'liability' | 'collision' | 'comprehensive')}
              >
                <option value="liability">{t('insuranceOverview.liability')}</option>
                <option value="collision">{t('insuranceOverview.collision')}</option>
                <option value="comprehensive">{t('insuranceOverview.comprehensive')}</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" className="btn-refresh" disabled={calculating}>
                {calculating ? t('insuranceOverview.calculating') : t('insuranceOverview.getEstimate')}
              </button>
            </div>
          </form>
          {estimate && (
            <div className="insurance-calculator-result">
              <div className="total">
                {t('insuranceOverview.estimatedPremium')}: ${estimate.estimatedPremium.toLocaleString()} / {estimate.period}
              </div>
              <div className="breakdown">
                {estimate.breakdown.map((b, i) => (
                  <span key={i}>{b.label}: ${b.amount.toLocaleString()}</span>
                ))}
              </div>
            </div>
          )}
        </section>

        <div className="insurance-claims-cta">
          {t('insuranceOverview.claimsCta')}
        </div>

        <p className="insurance-updated">
          {t('insuranceOverview.lastUpdated')}: {formatDate(lastUpdated)}
        </p>
      </div>
    </DriverScreen>
  )
}
