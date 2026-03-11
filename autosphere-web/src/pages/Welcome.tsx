import { Link } from 'react-router-dom'
import { PLATFORMS } from '../config/platforms'
import { useI18n } from '../i18n/context'
import './Welcome.css'

function pathToNavKey(path: string): string {
  return path.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
}

export default function Welcome() {
  const { t } = useI18n()
  return (
    <div className="welcome">
      <div className="welcome-bg" aria-hidden="true" />
      <div className="welcome-content">
        <div className="welcome-hero">
          <span className="welcome-badge">{t('welcome.badge')}</span>
          <h1 className="welcome-title">
            {t('welcome.title')}
            <span className="welcome-title-accent">{t('welcome.titleAccent')}</span>
          </h1>
          <p className="welcome-subtitle">
            {t('welcome.subtitle')}
          </p>
        </div>

        <div className="welcome-cards">
          {PLATFORMS.map(({ path, icon, screens }) => (
            <Link
              key={path}
              to={`/app/${path}`}
              className="welcome-card"
            >
              <span className="welcome-card-icon">{icon}</span>
              <div className="welcome-card-body">
                <h3>{t(`nav.${pathToNavKey(path)}`)}</h3>
                <p>{screens.length} {t('welcome.screensCount')}</p>
              </div>
              <span className="welcome-card-arrow">→</span>
            </Link>
          ))}
        </div>

        <footer className="welcome-footer">
          <p>{t('welcome.footer')}</p>
        </footer>
      </div>
    </div>
  )
}
