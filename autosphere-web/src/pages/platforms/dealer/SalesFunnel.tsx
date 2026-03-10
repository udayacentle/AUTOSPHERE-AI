import DealerScreen from './DealerScreen'

export default function SalesFunnel() {
  return (
    <DealerScreen
      title="Sales Funnel"
      subtitle="Pipeline stages from lead to delivery"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Stages</h3>
          <p>Lead → Qualified → Proposal → Negotiation → Won / Lost.</p>
        </div>
        <div className="card">
          <h3>Kanban / list</h3>
          <p>Deals by stage, drag-and-drop, value per stage.</p>
        </div>
        <div className="card">
          <h3>Conversion rates</h3>
          <p>Stage-to-stage conversion and drop-off.</p>
        </div>
      </div>
    </DealerScreen>
  )
}
