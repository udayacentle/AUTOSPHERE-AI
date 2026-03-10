import DealerScreen from './DealerScreen'

export default function DigitalTwinInventoryView() {
  return (
    <DealerScreen
      title="Digital Twin Inventory View"
      subtitle="Visualize inventory with vehicle digital twins"
    >
      <div className="card-grid">
        <div className="card">
          <h3>3D / digital twin</h3>
          <p>Per-vehicle health, history, and condition view.</p>
        </div>
        <div className="card">
          <h3>Bulk view</h3>
          <p>Grid or map of all vehicles with twin status.</p>
        </div>
        <div className="card">
          <h3>Drill-down</h3>
          <p>Click vehicle for full digital twin details.</p>
        </div>
      </div>
    </DealerScreen>
  )
}
