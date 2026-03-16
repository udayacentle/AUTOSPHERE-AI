import { useState, useEffect, useMemo } from 'react'
import DriverScreen from './DriverScreen'
import { api, type LoanCalculationData, type LoanRatesData } from '../../../api/client'
import { useI18n } from '../../../i18n/context'
import './LoanCalculator.css'

function localEMI(principal: number, annualRatePercent: number, tenureYears: number): number {
  if (principal <= 0 || tenureYears <= 0) return 0
  const r = annualRatePercent / 100 / 12
  const n = tenureYears * 12
  if (r === 0) return principal / n
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

export default function LoanCalculator() {
  const { t } = useI18n()
  const [principal, setPrincipal] = useState(25000)
  const [downPayment, setDownPayment] = useState(0)
  const [rate, setRate] = useState(8.5)
  const [tenure, setTenure] = useState(5)

  const [rates, setRates] = useState<LoanRatesData | null>(null)
  const [result, setResult] = useState<LoanCalculationData | null>(null)
  const [calculating, setCalculating] = useState(false)
  const [error, setError] = useState('')

  const principalUsed = Math.max(0, principal - downPayment)

  const localResult = useMemo(() => {
    const emi = localEMI(principalUsed, rate, tenure)
    const totalPayment = emi * tenure * 12
    const totalInterest = totalPayment - principalUsed
    return {
      emi,
      totalPayment,
      totalInterest,
      principalUsed,
    }
  }, [principalUsed, rate, tenure])

  useEffect(() => {
    api.getLoanRates().then(setRates).catch(() => {})
  }, [])

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setCalculating(true)
    setResult(null)
    try {
      const data = await api.getLoanCalculation({
        principal,
        downPayment,
        rate,
        tenure,
      })
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed')
      setResult({
        principal,
        downPayment,
        principalUsed,
        ratePercent: rate,
        tenureYears: tenure,
        tenureMonths: tenure * 12,
        emi: localResult.emi,
        totalPayment: localResult.totalPayment,
        totalInterest: localResult.totalInterest,
        currency: 'USD',
        amortizationSchedule: [],
      })
    } finally {
      setCalculating(false)
    }
  }

  const display = result ?? null
  const schedule = display?.amortizationSchedule ?? []

  return (
    <DriverScreen
      title="Loan & EMI Calculator"
      subtitle="Calculate monthly EMI from principal, rate, and tenure"
    >
      <div className="loan-calculator-page">
        {rates?.rates && rates.rates.length > 0 && (
          <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {t('loan.sampleRates')}: {rates?.rates?.map((r) => `${r.label} ${r.ratePercent}%`).join(' · ') ?? ''}
          </p>
        )}

        <section className="card loan-card" style={{ marginBottom: '1.5rem' }}>
          <form onSubmit={handleCalculate} className="loan-form">
            <div className="loan-form-grid">
              <label>
                <span className="loan-label">{t('loan.principal')}</span>
                <input
                  type="number"
                  min={1000}
                  max={500000}
                  step={1000}
                  value={principal}
                  onChange={(e) => setPrincipal(Number(e.target.value) || 0)}
                  className="loan-input"
                />
              </label>
              <label>
                <span className="loan-label">{t('loan.downPayment')}</span>
                <input
                  type="number"
                  min={0}
                  max={principal}
                  step={500}
                  value={downPayment}
                  onChange={(e) => setDownPayment(Math.min(principal, Number(e.target.value) || 0))}
                  className="loan-input"
                />
              </label>
              <label>
                <span className="loan-label">{t('loan.interestRate')}</span>
                <input
                  type="number"
                  min={0}
                  max={30}
                  step={0.1}
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value) || 0)}
                  className="loan-input"
                />
              </label>
              <label>
                <span className="loan-label">{t('loan.tenure')}</span>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value) || 1)}
                  className="loan-input"
                />
              </label>
            </div>
            {error && (
              <p style={{ color: 'var(--danger)', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
                {error}
              </p>
            )}
            <button type="submit" className="btn-primary" disabled={calculating}>
              {calculating ? t('loan.calculating') : t('loan.calculate')}
            </button>
          </form>
        </section>

        {display && (
          <>
            <section className="card loan-card loan-result" style={{ marginBottom: '1.5rem' }}>
              <h3>{t('loan.monthlyEmi')}</h3>
              <p className="loan-emi-value">
                {display.currency} {display.emi.toFixed(2)}
              </p>
              <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {t('loan.totalPayment')}: {display.currency} {display.totalPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })} · {t('loan.totalInterest')}: {display.currency} {display.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              {downPayment > 0 && (
                <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Loan amount after down payment: {display.currency} {display.principalUsed.toLocaleString()}
                </p>
              )}
            </section>

            {schedule.length > 0 && (
              <section className="card loan-card" style={{ marginBottom: '1.5rem' }}>
                <h3>{t('loan.amortization')}</h3>
                <div className="loan-table-wrap">
                  <table className="loan-table">
                    <thead>
                      <tr>
                        <th>{t('loan.month')}</th>
                        <th>EMI</th>
                        <th>{t('loan.principalPaid')}</th>
                        <th>{t('loan.interestPaid')}</th>
                        <th>{t('loan.balance')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.map((row) => (
                        <tr key={row.month}>
                          <td>{row.month}</td>
                          <td>{row.emi.toFixed(2)}</td>
                          <td>{row.principal.toFixed(2)}</td>
                          <td>{row.interest.toFixed(2)}</td>
                          <td>{row.balance.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </DriverScreen>
  )
}
