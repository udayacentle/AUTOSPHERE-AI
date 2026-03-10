import DealerScreen from './DealerScreen'

export default function FinanceIntegrationPanel() {
  return (
    <DealerScreen
      title="Finance Integration Panel"
      subtitle="Finance and lending partner integration"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Lender links</h3>
          <p>Banks, captives, approval APIs, rate sheets.</p>
        </div>
        <div className="card">
          <h3>Quote & submit</h3>
          <p>Payment calculator, submit application, status.</p>
        </div>
        <div className="card">
          <h3>Deal structure</h3>
          <p>Loan vs lease, term, down payment, trade-in.</p>
        </div>
      </div>
    </DealerScreen>
  )
}
