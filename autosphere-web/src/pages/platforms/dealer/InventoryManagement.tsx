import DealerScreen from './DealerScreen'

export default function InventoryManagement() {
  return (
    <DealerScreen
      title="Inventory Management"
      subtitle="Manage vehicle stock and availability"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Vehicle list</h3>
          <p>Search, filter by make, model, status, price range.</p>
        </div>
        <div className="card">
          <h3>Stock status</h3>
          <p>In stock, reserved, sold, in transit.</p>
        </div>
        <div className="card">
          <h3>Age & turn rate</h3>
          <p>Days in stock, turn metrics, aging alerts.</p>
        </div>
      </div>
    </DealerScreen>
  )
}
