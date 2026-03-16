import { useI18n } from '../../../i18n/context'
import { api, type FleetOrganizationItem } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import FleetScreen from './FleetScreen'
import './Organizations.css'

const FALLBACK_ORGANIZATIONS: FleetOrganizationItem[] = [
  { name: 'AutoSphere Fleet West', slug: 'autosphere-west', contactEmail: 'fleet-west@autosphere.ai', contactPhone: '+1-415-555-0100', address: 'San Francisco, CA', status: 'active' },
  { name: 'Metro Logistics', slug: 'metro-logistics', contactEmail: 'admin@metrologistics.com', contactPhone: '+1-415-555-0200', address: 'Oakland, CA', status: 'active' },
]

export default function FleetOrganizations() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<FleetOrganizationItem[] | null>(
    () => api.getFleetOrganizations()
  )
  const organizations = Array.isArray(data) ? data : (error ? FALLBACK_ORGANIZATIONS : [])

  if (loading) {
    return (
      <FleetScreen title={t('fleet.organizationsTitle')} subtitle={t('fleet.organizationsSubtitle')}>
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </FleetScreen>
    )
  }

  return (
    <FleetScreen title={t('fleet.organizationsTitle')} subtitle={t('fleet.organizationsSubtitle')}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
      {error && (
        <p className="fleet-offline-banner" style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: 8 }}>
          {t('fleet.showingSampleData')}
        </p>
      )}
      <section className="fleet-data-card card">
        <h3>{t('fleet.organizationsTitle')}</h3>
        {organizations.length === 0 ? (
          <p className="fleet-empty">{t('fleet.noOrganizations')}</p>
        ) : (
          <ul className="fleet-organizations-list">
            {organizations.map((org) => (
              <li key={org._id ?? org.id ?? org.slug ?? org.name} className="fleet-org-item card">
                <div className="fleet-org-header">
                  <h4 className="fleet-org-name">{org.name}</h4>
                  <span className={`fleet-badge fleet-badge-${(org.status ?? 'active').toLowerCase()}`}>
                    {org.status ?? 'active'}
                  </span>
                </div>
                {org.slug && <p className="fleet-org-slug">{org.slug}</p>}
                <dl className="fleet-org-details">
                  {org.contactEmail && (
                    <>
                      <dt>{t('fleet.contactEmail')}</dt>
                      <dd><a href={`mailto:${org.contactEmail}`}>{org.contactEmail}</a></dd>
                    </>
                  )}
                  {org.contactPhone && (
                    <>
                      <dt>{t('fleet.contactPhone')}</dt>
                      <dd><a href={`tel:${org.contactPhone}`}>{org.contactPhone}</a></dd>
                    </>
                  )}
                  {org.address && (
                    <>
                      <dt>{t('fleet.address')}</dt>
                      <dd>{org.address}</dd>
                    </>
                  )}
                </dl>
              </li>
            ))}
          </ul>
        )}
      </section>
    </FleetScreen>
  )
}
