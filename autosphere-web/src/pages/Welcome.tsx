import { Link } from 'react-router-dom'
import { PLATFORMS } from '../config/platforms'
import './Welcome.css'

export default function Welcome() {
  return (
    <div className="welcome">
      <div className="welcome-bg" aria-hidden="true" />
      <div className="welcome-content">
        <div className="welcome-hero">
          <span className="welcome-badge">AutoSphere AI</span>
          <h1 className="welcome-title">
            Welcome to your
            <span className="welcome-title-accent"> Command Center</span>
          </h1>
          <p className="welcome-subtitle">
            Choose a platform from the sidebar or pick one below to get started.
          </p>
        </div>

        <div className="welcome-cards">
          {PLATFORMS.map(({ path, label, icon, screens }) => (
            <Link
              key={path}
              to={`/app/${path}`}
              className="welcome-card"
            >
              <span className="welcome-card-icon">{icon}</span>
              <div className="welcome-card-body">
                <h3>{label}</h3>
                <p>{screens.length} screens</p>
              </div>
              <span className="welcome-card-arrow">→</span>
            </Link>
          ))}
        </div>

        <footer className="welcome-footer">
          <p>Mobility & vehicle intelligence · Powered by AI</p>
        </footer>
      </div>
    </div>
  )
}
