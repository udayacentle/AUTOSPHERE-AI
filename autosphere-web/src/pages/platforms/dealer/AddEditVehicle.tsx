import DealerScreen from './DealerScreen'

export default function AddEditVehicle() {
  return (
    <DealerScreen
      title="Add/Edit Vehicle"
      subtitle="Create or update vehicle listing"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Vehicle details</h3>
          <p>VIN, make, model, year, trim, mileage, condition.</p>
        </div>
        <div className="card">
          <h3>Pricing & photos</h3>
          <p>List price, cost, image upload, digital twin link.</p>
        </div>
        <div className="card">
          <h3>Specs & history</h3>
          <p>Options, service history, accident report.</p>
        </div>
      </div>
    </DealerScreen>
  )
}
