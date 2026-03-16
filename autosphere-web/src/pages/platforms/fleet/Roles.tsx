import { useI18n } from '../../../i18n/context'
import { api, type FleetRoleItem } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import FleetScreen from './FleetScreen'
import './Roles.css'

const FALLBACK_ROLES: FleetRoleItem[] = [
  { name: 'Fleet Admin', slug: 'fleet-admin', description: 'Full access to fleet, organizations, and users', permissions: ['fleet:read', 'fleet:write', 'orgs:manage', 'roles:manage'] },
  { name: 'Fleet Manager', slug: 'fleet-manager', description: 'Manage vehicles, drivers, and maintenance', permissions: ['fleet:read', 'fleet:write', 'vehicles:manage', 'drivers:manage'] },
  { name: 'Driver', slug: 'driver', description: 'View own trips and vehicle', permissions: ['fleet:read', 'trips:read'] },
  { name: 'Viewer', slug: 'viewer', description: 'Read-only fleet dashboard', permissions: ['fleet:read'] },
]

export default function FleetRoles() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<FleetRoleItem[] | null>(
    () => api.getFleetRoles()
  )
  const roles = Array.isArray(data) ? data : (error ? FALLBACK_ROLES : [])

  if (loading) {
    return (
      <FleetScreen title={t('fleet.rolesTitle')} subtitle={t('fleet.rolesSubtitle')}>
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </FleetScreen>
    )
  }

  return (
    <FleetScreen title={t('fleet.rolesTitle')} subtitle={t('fleet.rolesSubtitle')}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
      {error && (
        <p className="fleet-offline-banner" style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: 8 }}>
          {t('fleet.showingSampleData')}
        </p>
      )}
      <section className="fleet-data-card card">
        <h3>{t('fleet.rolesTitle')}</h3>
        {roles.length === 0 ? (
          <p className="fleet-empty">{t('fleet.noRoles')}</p>
        ) : (
          <ul className="fleet-roles-list">
            {roles.map((role) => (
              <li key={role._id ?? role.id ?? role.slug ?? role.name} className="fleet-role-item card">
                <div className="fleet-role-header">
                  <h4 className="fleet-role-name">{role.name}</h4>
                  {role.slug && <code className="fleet-role-slug">{role.slug}</code>}
                </div>
                {role.description && <p className="fleet-role-desc">{role.description}</p>}
                {role.permissions && role.permissions.length > 0 && (
                  <div className="fleet-role-permissions">
                    <span className="fleet-role-perms-label">{t('fleet.permissions')}:</span>
                    <ul className="fleet-perms-list">
                      {role.permissions.map((perm) => (
                        <li key={perm}><code>{perm}</code></li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </FleetScreen>
  )
}
