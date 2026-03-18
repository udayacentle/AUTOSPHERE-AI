import { useI18n } from '../../../i18n/context'
import { api, type FleetRoleItem } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import FleetScreen from './FleetScreen'
import './Roles.css'

const FALLBACK_ROLES: FleetRoleItem[] = [
  { name: 'Driver', slug: 'driver', description: 'View assigned trips; accept/reject; update trip status (Start, In Progress, Completed); access navigation. No management or reports.', permissions: ['view_vehicles:limited', 'update_trip_status', 'manage_trips:assigned'] },
  { name: 'Passenger', slug: 'passenger', description: 'Book or schedule rides; track trips; view trip history; access basic billing. Limited to own data.', permissions: ['view_vehicles:limited', 'book_ride', 'manage_trips:own', 'billing:limited'] },
  { name: 'Entity Admin', slug: 'entity_admin', description: 'Manage vehicles, drivers, passengers; assign and monitor trips; reports and analytics; billing. One organization.', permissions: ['view_vehicles:full', 'book_ride', 'manage_trips:full', 'update_trip_status', 'manage_vehicles', 'manage_users', 'reports_analytics', 'billing:full', 'system_config:limited'] },
  { name: 'Super Admin', slug: 'super_admin', description: 'Full system control; all organizations; system settings; all reports; manage roles and permissions.', permissions: ['view_vehicles:full', 'book_ride', 'manage_trips:full', 'update_trip_status', 'manage_vehicles', 'manage_users', 'reports_analytics', 'billing:full', 'system_config:full', 'multi_organization'] },
  { name: 'Guest User', slug: 'guest', description: 'View limited public information. No booking or management access.', permissions: ['view_vehicles:limited'] },
]

export default function FleetRoles() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<FleetRoleItem[] | null>(() => api.getFleetRoles())
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
