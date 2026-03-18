import { useI18n } from '../i18n/context'
import { useFleetRole } from '../contexts/FleetRoleContext'
import type { FleetDemoRole } from '../config/fleetRoleAccess'
import './FleetRoleBanner.css'

const ROLE_OPTIONS: { value: FleetDemoRole; labelKey: string }[] = [
  { value: 'super_admin', labelKey: 'fleet.roleSuperAdmin' },
  { value: 'entity_admin', labelKey: 'fleet.roleEntityAdmin' },
  { value: 'driver', labelKey: 'fleet.roleDriver' },
  { value: 'passenger', labelKey: 'fleet.rolePassenger' },
  { value: 'guest', labelKey: 'fleet.roleGuest' },
]

export default function FleetRoleBanner() {
  const { t } = useI18n()
  const { role, setRole } = useFleetRole()

  return (
    <div className="fleet-role-banner" role="region" aria-label={t('fleet.roleBannerAria')}>
      <div className="fleet-role-banner-inner">
        <span className="fleet-role-banner-label">{t('fleet.roleLabelPrefix')}</span>
        <select
          className="fleet-role-banner-select"
          value={role}
          onChange={(e) => setRole(e.target.value as FleetDemoRole)}
          aria-label={t('fleet.roleSelectAria')}
        >
          {ROLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {t(o.labelKey)}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
