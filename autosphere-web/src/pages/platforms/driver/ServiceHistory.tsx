import DriverScreen from './DriverScreen'

export default function ServiceHistory() {
  return (
    <DriverScreen
      title="Service History Timeline"
      subtitle="Past services and repairs"
    >
      <ul className="screen-list">
        {['Oil change – Jan 2026', 'Brake inspection – Dec 2025', 'Tire rotation – Nov 2025'].map((item) => (
          <li key={item}><span>{item}</span></li>
        ))}
      </ul>
      <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        Add service records and view by date or type.
      </p>
    </DriverScreen>
  )
}
