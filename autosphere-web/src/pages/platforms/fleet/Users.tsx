import { useState } from 'react'
import { useI18n } from '../../../i18n/context'
import { api, type FleetUserItem } from '../../../api/client'
import { useApiData } from '../../../hooks/useApiData'
import FleetScreen from './FleetScreen'
import './Roles.css'

const ROLE_OPTIONS = ['driver', 'passenger', 'entity_admin', 'super_admin', 'guest'] as const

const FALLBACK_USERS: FleetUserItem[] = [
  { userId: 'user-super-1', email: 'admin@autosphere.ai', fullName: 'System Super Admin', roleSlug: 'super_admin', status: 'active' },
  { userId: 'user-entity-1', email: 'fleet.admin@autosphere-west.com', fullName: 'Jane Fleet Admin', roleSlug: 'entity_admin', status: 'active' },
  { userId: 'user-driver-1', email: 'james.w@fleet.com', fullName: 'James Wilson', roleSlug: 'driver', status: 'active' },
  { userId: 'user-driver-2', email: 'maria.s@fleet.com', fullName: 'Maria Santos', roleSlug: 'driver', status: 'active' },
  { userId: 'user-passenger-1', email: 'passenger1@example.com', fullName: 'Alex Rider', roleSlug: 'passenger', status: 'active' },
  { userId: 'user-passenger-2', email: 'passenger2@example.com', fullName: 'Sam Carter', roleSlug: 'passenger', status: 'active' },
  { userId: 'user-guest-1', email: 'guest@example.com', fullName: 'Guest Viewer', roleSlug: 'guest', status: 'active' },
]

export default function FleetUsers() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<FleetUserItem[] | null>(() => api.getFleetUsers())
  const users = Array.isArray(data) ? data : (error ? FALLBACK_USERS : [])
  const [pendingRole, setPendingRole] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)

  const updateRole = async (userId: string) => {
    const roleSlug = pendingRole[userId]
    if (!roleSlug) return
    setSaving(userId)
    try {
      await api.patchFleetUserRole(userId, { roleSlug, actorUserId: 'user-entity-1' })
      await refetch()
      setPendingRole((p) => {
        const n = { ...p }
        delete n[userId]
        return n
      })
    } catch {
      /* ignore */
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <FleetScreen title={t('fleet.usersTitle') || 'Users'} subtitle={t('fleet.usersSubtitle') || 'Fleet users and roles'}>
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </FleetScreen>
    )
  }

  return (
    <FleetScreen title={t('fleet.usersTitle') || 'Users'} subtitle={t('fleet.usersSubtitle') || 'Fleet users and roles'}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button type="button" className="btn-refresh" onClick={() => refetch()}>{t('common.refresh')}</button>
      </div>
      {error && (
        <p className="fleet-offline-banner" style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: 8 }}>
          {t('fleet.showingSampleData')}
        </p>
      )}
      <section className="fleet-data-card card">
        <h3>{t('fleet.usersTitle') || 'Users'}</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          {t('fleet.usersIntro')}{' '}
          {t('fleet.usersRoleAudit')}
        </p>
        {users.length === 0 ? (
          <p className="fleet-empty">{t('fleet.noUsers') || 'No users'}</p>
        ) : (
          <div className="fleet-matrix-table-wrap">
            <table className="fleet-matrix-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>{t('fleet.usersChangeRole')}</th>
                  <th>Organization</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.userId}>
                    <td><code>{u.userId}</code></td>
                    <td>{u.fullName ?? '—'}</td>
                    <td>{u.email ?? '—'}</td>
                    <td><span className="fleet-role-slug">{u.roleSlug}</span></td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
                        <select
                          value={pendingRole[u.userId] ?? u.roleSlug ?? ''}
                          onChange={(e) => setPendingRole((p) => ({ ...p, [u.userId]: e.target.value }))}
                          style={{ padding: '0.25rem', fontSize: '0.85rem', borderRadius: 6, border: '1px solid var(--border)' }}
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="btn-refresh"
                          style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                          disabled={saving === u.userId || (pendingRole[u.userId] ?? u.roleSlug) === u.roleSlug}
                          onClick={() => updateRole(u.userId)}
                        >
                          {saving === u.userId ? '…' : t('fleet.usersApplyRole')}
                        </button>
                      </div>
                    </td>
                    <td>
                      {typeof u.organizationId === 'object'
                        ? (u.organizationId?.name ?? u.organizationId?.slug ?? '—')
                        : (u.organizationId ?? '—')}
                    </td>
                    <td>{u.status ?? 'active'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </FleetScreen>
  )
}
