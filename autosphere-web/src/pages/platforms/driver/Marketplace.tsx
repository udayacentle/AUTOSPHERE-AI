import DriverScreen from './DriverScreen'

export default function Marketplace() {
  return (
    <DriverScreen
      title="Marketplace"
      subtitle="Products and services for your vehicle"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Accessories</h3>
          <p>Gadgets, interior, exterior</p>
        </div>
        <div className="card">
          <h3>Services</h3>
          <p>Detailing, repairs, insurance</p>
        </div>
        <div className="card">
          <h3>Deals</h3>
          <p>Offers and discounts</p>
        </div>
      </div>
    </DriverScreen>
  )
}
