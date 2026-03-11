import PropertyScreen from './PropertyScreen'

export default function SlotManagement() {
  return (
    <PropertyScreen
      title="Slot Management"
      subtitle="Manage parking and EV charging slots"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Slot list</h3>
          <p>All slots: ID, type (parking/EV), status, reservation.</p>
        </div>
        <div className="card">
          <h3>Add / edit slots</h3>
          <p>Create slots, set type, disable or reserve.</p>
        </div>
        <div className="card">
          <h3>Bulk actions</h3>
          <p>Block zone, set maintenance, pricing override.</p>
        </div>
      </div>
    </PropertyScreen>
  )
}
