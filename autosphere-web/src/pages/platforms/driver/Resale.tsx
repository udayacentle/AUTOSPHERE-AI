import { useState, useEffect } from 'react'
import DriverScreen from './DriverScreen'
import {
  api,
  type ResaleEstimateData,
  type ResaleOptionsData,
  type ResaleEstimateFactor,
} from '../../../api/client'
import { useI18n } from '../../../i18n/context'
import './Resale.css'

const CURRENT_YEAR = new Date().getFullYear()
const FALLBACK_MAKES = ['Toyota', 'Honda', 'Ford', 'Tesla', 'Chevrolet']
const FALLBACK_MODELS: Record<string, string[]> = {
  Toyota: ['Camry', 'Corolla', 'RAV4', 'Highlander'],
  Honda: ['Accord', 'Civic', 'CR-V', 'Pilot'],
  Ford: ['F-150', 'Transit', 'Mustang', 'Explorer'],
  Tesla: ['Model 3', 'Model Y', 'Model S'],
  Chevrolet: ['Silverado', 'Equinox', 'Malibu'],
}

const CONDITION_OPTIONS = ['excellent', 'good', 'fair', 'poor'] as const

export default function Resale() {
  const { t } = useI18n()
  const [options, setOptions] = useState<ResaleOptionsData | null>(null)
  const [optionsError, setOptionsError] = useState(false)

  const [make, setMake] = useState('Toyota')
  const [model, setModel] = useState('Camry')
  const [year, setYear] = useState(CURRENT_YEAR - 2)
  const [mileage, setMileage] = useState(30000)
  const [condition, setCondition] = useState<string>('good')

  const [estimate, setEstimate] = useState<ResaleEstimateData | null>(null)
  const [estimating, setEstimating] = useState(false)
  const [estimateError, setEstimateError] = useState('')

  const makes = options?.makes ?? FALLBACK_MAKES
  const modelsForMake = options?.models?.[make] ?? FALLBACK_MODELS[make] ?? ['Camry']

  useEffect(() => {
    api
      .getResaleOptions()
      .then(setOptions)
      .catch(() => setOptionsError(true))
  }, [])

  useEffect(() => {
    const models = options?.models?.[make] ?? FALLBACK_MODELS[make]
    if (models?.length && !models.includes(model)) {
      setModel(models[0])
    }
  }, [make, options])

  const handleGetEstimate = async (e: React.FormEvent) => {
    e.preventDefault()
    setEstimateError('')
    setEstimating(true)
    setEstimate(null)
    try {
      const data = await api.getResaleEstimate({
        make,
        model,
        year,
        mileage,
        condition,
      })
      setEstimate(data)
    } catch (err) {
      setEstimateError(err instanceof Error ? err.message : 'Estimate failed')
    } finally {
      setEstimating(false)
    }
  }

  const conditionLabel = (c: string) => {
    if (c === 'excellent') return t('resale.conditionExcellent')
    if (c === 'good') return t('resale.conditionGood')
    if (c === 'fair') return t('resale.conditionFair')
    if (c === 'poor') return t('resale.conditionPoor')
    return c
  }

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
    } catch {
      return iso
    }
  }

  return (
    <DriverScreen
      title="Resale Value Estimator"
      subtitle="Estimated market value of your vehicle"
    >
      <div className="resale-page">
        {optionsError && (
          <p
            style={{
              marginBottom: '1rem',
              padding: '0.75rem',
              background: 'var(--bg-elevated)',
              borderRadius: 8,
            }}
          >
            Using default vehicle options. Start backend for full list.
          </p>
        )}

        <section className="card resale-card" style={{ marginBottom: '1.5rem' }}>
          <h3>{t('resale.currentEstimate')}</h3>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {t('resale.basedOn')}
          </p>
          <form onSubmit={handleGetEstimate} className="resale-form">
            <div className="resale-form-row">
              <label>
                <span className="resale-label">{t('resale.make')}</span>
                <select
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className="resale-select"
                >
                  <option value="">{t('resale.selectMake')}</option>
                  {makes.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="resale-label">{t('resale.model')}</span>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="resale-select"
                >
                  <option value="">{t('resale.selectModel')}</option>
                  {modelsForMake.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="resale-form-row">
              <label>
                <span className="resale-label">{t('resale.year')}</span>
                <input
                  type="number"
                  min={CURRENT_YEAR - 15}
                  max={CURRENT_YEAR + 1}
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value) || CURRENT_YEAR)}
                  className="resale-input"
                />
              </label>
              <label>
                <span className="resale-label">{t('resale.mileage')}</span>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={mileage}
                  onChange={(e) => setMileage(Number(e.target.value) || 0)}
                  className="resale-input"
                />
              </label>
            </div>
            <label>
              <span className="resale-label">{t('resale.condition')}</span>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="resale-select"
              >
                {CONDITION_OPTIONS.map((c) => (
                  <option key={c} value={c}>{conditionLabel(c)}</option>
                ))}
              </select>
            </label>
            {estimateError && (
              <p style={{ color: 'var(--danger)', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
                {estimateError}
              </p>
            )}
            <button
              type="submit"
              className="btn-primary"
              disabled={estimating || !make || !model}
            >
              {estimating ? t('resale.estimating') : t('resale.getEstimate')}
            </button>
          </form>
        </section>

        {estimate ? (
          <>
            <section className="card resale-card resale-result" style={{ marginBottom: '1.5rem' }}>
              <h3>{t('resale.estimatedValue')}</h3>
              <p className="resale-value-mid">
                {estimate.currency} {estimate.estimatedValueMid.toLocaleString()}
              </p>
              <p className="resale-value-range">
                {t('resale.valueRange')}: {estimate.currency} {estimate.estimatedValueLow.toLocaleString()} – {estimate.estimatedValueHigh.toLocaleString()}
              </p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {t('resale.lastUpdated')}: {formatDate(estimate.lastUpdated)}
              </p>
            </section>

            <section className="card resale-card" style={{ marginBottom: '1.5rem' }}>
              <h3>{t('resale.factors')}</h3>
              <ul className="resale-factors-list">
                {estimate.factors.map((f: ResaleEstimateFactor, i: number) => (
                  <li key={i} className="resale-factor-item">
                    <span className="resale-factor-name">{f.name}</span>
                    <span className="resale-factor-impact">{f.impact}</span>
                    <span className="resale-factor-detail">{f.detail}</span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : (
          !estimating && (
            <section className="card resale-card" style={{ marginBottom: '1.5rem' }}>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{t('resale.noEstimateYet')}</p>
            </section>
          )
        )}

        <section className="card resale-card">
          <h3>{t('resale.sellTradeIn')}</h3>
          <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {t('resale.optionsAndNextSteps')}
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
            Use this estimate when selling privately or at a dealer. Trade-in values are typically below private sale. Get a formal quote from a dealer or use an online marketplace for listing.
          </p>
        </section>
      </div>
    </DriverScreen>
  )
}
