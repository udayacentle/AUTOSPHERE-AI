import DriverScreen from './DriverScreen'

export default function ClaimStatus() {
  return (
    <DriverScreen
      title="Claim Status Tracker"
      subtitle="Track your insurance claims"
    >
      <ul className="screen-list">
        {['Claim #001 – In review', 'Claim #002 – Approved', 'Claim #003 – Closed'].map((item) => (
          <li key={item}><span>{item}</span></li>
        ))}
      </ul>
    </DriverScreen>
  )
}
