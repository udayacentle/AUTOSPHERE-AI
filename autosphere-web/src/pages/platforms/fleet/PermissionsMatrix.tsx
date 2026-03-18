import { Link } from 'react-router-dom'
import { useI18n } from '../../../i18n/context'
import { api, type FleetPermissionsMatrix } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import FleetScreen from './FleetScreen'
import './Roles.css'

const FALLBACK_MATRIX: FleetPermissionsMatrix = {
  roles: ['Driver', 'Passenger', 'Entity Admin', 'Super Admin', 'Guest User'],
  features: [
    { id: 'view_vehicles', name: 'View Vehicles', driver: 'Limited', passenger: 'Limited', entity_admin: 'Full', super_admin: 'Full', guest: 'Limited' },
    { id: 'book_ride', name: 'Book Ride', driver: 'No', passenger: 'Yes', entity_admin: 'Yes', super_admin: 'Yes', guest: 'No' },
    { id: 'manage_trips', name: 'Manage Trips', driver: 'Assigned', passenger: 'Own', entity_admin: 'Full', super_admin: 'Full', guest: 'No' },
    { id: 'update_trip_status', name: 'Update Trip Status', driver: 'Yes', passenger: 'No', entity_admin: 'Yes', super_admin: 'Yes', guest: 'No' },
    { id: 'manage_vehicles', name: 'Manage Vehicles', driver: 'No', passenger: 'No', entity_admin: 'Yes', super_admin: 'Yes', guest: 'No' },
    { id: 'manage_users', name: 'Manage Users', driver: 'No', passenger: 'No', entity_admin: 'Yes', super_admin: 'Yes', guest: 'No' },
    { id: 'reports_analytics', name: 'Reports & Analytics', driver: 'No', passenger: 'No', entity_admin: 'Yes', super_admin: 'Yes', guest: 'No' },
    { id: 'billing_access', name: 'Billing Access', driver: 'No', passenger: 'Limited', entity_admin: 'Yes', super_admin: 'Yes', guest: 'No' },
    { id: 'system_config', name: 'System Configuration', driver: 'No', passenger: 'No', entity_admin: 'Limited', super_admin: 'Full', guest: 'No' },
    { id: 'multi_organization', name: 'Multi-Organization', driver: 'No', passenger: 'No', entity_admin: 'No', super_admin: 'Yes', guest: 'No' },
  ],
  principles: [
    'Least Privilege: Users only get required access',
    'Role Hierarchy: Super Admin > Entity Admin > Others',
    'Data Isolation: Users access only relevant data',
  ],
}

export default function FleetPermissionsMatrix() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<FleetPermissionsMatrix | null>(() => api.getFleetPermissionsMatrix())
  const matrix = data ?? (error ? FALLBACK_MATRIX : null)

  if (loading && !matrix) {
    return (
      <FleetScreen title={t('fleet.permissionsMatrixPageTitle')} subtitle={t('fleet.permissionsMatrixPageSubtitle')}>
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </FleetScreen>
    )
  }

  const m = matrix ?? FALLBACK_MATRIX

  return (
    <FleetScreen title={t('fleet.permissionsMatrixPageTitle')} subtitle={t('fleet.permissionsMatrixPageSubtitle')}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>
          {t('common.refresh')}
        </button>
      </div>
      {error && (
        <p
          className="fleet-offline-banner"
          style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: 8 }}
        >
          {t('fleet.showingSampleData')}
        </p>
      )}

      <section className="fleet-data-card card fleet-permissions-matrix-section">
        <h3>{t('fleet.permissionsMatrix')}</h3>
        <p className="fleet-matrix-intro">{t('fleet.permissionsMatrixIntro')}</p>
        {m.principles && m.principles.length > 0 && (
          <ul className="fleet-principles-list">
            {m.principles.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        )}
        {m.features && m.features.length > 0 && (
          <div className="fleet-matrix-table-wrap">
            <table className="fleet-matrix-table">
              <thead>
                <tr>
                  <th>{t('fleet.matrixFeature')}</th>
                  {m.roles.map((role) => (
                    <th key={role}>{role}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {m.features.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.name}</strong>
                    </td>
                    <td>{row.driver}</td>
                    <td>{row.passenger}</td>
                    <td>{row.entity_admin}</td>
                    <td>{row.super_admin}</td>
                    <td>{row.guest}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="fleet-data-card card" style={{ marginTop: '1.5rem' }}>
        <h3>{t('fleet.brdPortalLinks')}</h3>
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', fontSize: '0.9rem', lineHeight: 1.7 }}>
          <li><Link to="/app/fleet/driver-console">{t('fleet.brdDriverTitle')}</Link></li>
          <li><Link to="/app/fleet/passenger-portal">{t('fleet.brdPassengerTitle')}</Link></li>
          <li><Link to="/app/fleet/passenger-billing">{t('fleet.brdBillingTitle')}</Link></li>
          <li><Link to="/app/fleet/guest-fleet">{t('fleet.brdGuestTitle')}</Link></li>
          <li><Link to="/app/fleet/activity-log">{t('fleet.brdActivityTitle')}</Link></li>
          <li><Link to="/app/fleet/system-settings">{t('fleet.brdSettingsTitle')}</Link></li>
        </ul>
      </section>

      <section className="fleet-data-card card" style={{ marginTop: '1.5rem' }}>
        <h3>{t('fleet.matrixSecurityNote')}</h3>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {t('fleet.matrixSecurityBody')}
        </p>
      </section>
    </FleetScreen>
  )
}
