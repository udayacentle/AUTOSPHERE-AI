import DriverScreen from './DriverScreen'

export default function Settings() {
  return (
    <DriverScreen
      title="Settings & Privacy Controls"
      subtitle="Account, notifications, and privacy"
    >
      <ul className="screen-list">
        {['Profile & account', 'Notifications', 'Privacy & data', 'Linked vehicles', 'Biometric sign-in', 'Theme', 'Language', 'Help & support', 'Log out'].map((item) => (
          <li key={item}><span>{item}</span></li>
        ))}
      </ul>
    </DriverScreen>
  )
}
