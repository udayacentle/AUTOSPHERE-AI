import DriverScreen from './DriverScreen'

export default function LoanCalculator() {
  return (
    <DriverScreen
      title="Loan & EMI Calculator"
      subtitle="Calculate loan and monthly EMI"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Loan amount</h3>
          <p>Principal input</p>
        </div>
        <div className="card">
          <h3>Tenure & rate</h3>
          <p>Years, interest %</p>
        </div>
        <div className="card">
          <h3>EMI result</h3>
          <p>Monthly payment</p>
        </div>
      </div>
    </DriverScreen>
  )
}
