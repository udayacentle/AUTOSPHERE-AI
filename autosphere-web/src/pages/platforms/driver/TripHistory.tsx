import DriverScreen from './DriverScreen'

export default function TripHistory() {
  return (
    <DriverScreen
      title="Trip History & Trip Summary"
      subtitle="Past trips and summaries"
    >
      <ul className="screen-list">
        {['Trip 1 – 45 km – Today', 'Trip 2 – 12 km – Yesterday', 'Trip 3 – 78 km – 2 days ago'].map((item) => (
          <li key={item}><span>{item}</span></li>
        ))}
      </ul>
      <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        Tap a trip for map, distance, duration, and score.
      </p>
    </DriverScreen>
  )
}
