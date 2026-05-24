import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { api, ApiError } from '../../api/client'
import { resolveAuthStore } from '../../di/container'
import type { AuthUser, Privilege } from '../../types/auth'
import { AuthButton } from './AuthUi'

const authStore = resolveAuthStore()

export const AdminPage = observer(function AdminPage() {
  const [users, setUsers] = useState<AuthUser[]>([])
  const [privileges, setPrivileges] = useState<Privilege[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const selectedIdRef = useRef<string | null>(null)
  selectedIdRef.current = selectedId

  const selectedUser = users.find((u) => u.id === selectedId) ?? null
  const pendingCount = users.filter((u) => u.status === 'pending').length

  const loadData = useCallback(async (options?: { preserveSelection?: boolean }) => {
    const preserveSelection = options?.preserveSelection ?? false
    if (preserveSelection) {
      setRefreshing(true)
    } else {
      setInitialLoading(true)
    }
    setError(null)

    try {
      const [usersRes, privRes] = await Promise.all([
        api.adminUsers(),
        api.adminPrivileges(),
      ])
      setUsers(usersRes.users)
      setPrivileges(privRes.privileges)

      const currentSelectedId = selectedIdRef.current
      if (preserveSelection && currentSelectedId) {
        const refreshed = usersRes.users.find((u) => u.id === currentSelectedId)
        if (refreshed) {
          setSelectedKeys(refreshed.privileges)
        } else if (usersRes.users.length > 0) {
          setSelectedId(usersRes.users[0].id)
          setSelectedKeys(usersRes.users[0].privileges)
        } else {
          setSelectedId(null)
          setSelectedKeys([])
        }
      } else if (!currentSelectedId && usersRes.users.length > 0) {
        setSelectedId(usersRes.users[0].id)
        setSelectedKeys(usersRes.users[0].privileges)
      }

      setHasLoaded(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load admin data')
    } finally {
      setInitialLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (authStore.isLoading || !authStore.isAdmin) return
    void loadData()
  }, [authStore.isLoading, authStore.isAdmin, loadData])

  function handleRefresh() {
    void loadData({ preserveSelection: true })
  }

  function selectUser(user: AuthUser) {
    setSelectedId(user.id)
    setSelectedKeys(user.privileges)
  }

  async function updateStatus(status: AuthUser['status']) {
    if (!selectedUser) return
    setSaving(true)
    setError(null)
    try {
      const { user } = await api.updateUserStatus(selectedUser.id, { status })
      setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)))
      selectUser(user)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Status update failed')
    } finally {
      setSaving(false)
    }
  }

  async function savePrivileges() {
    if (!selectedUser) return
    setSaving(true)
    setError(null)
    try {
      const { user } = await api.updateUserPrivileges(selectedUser.id, {
        privilegeKeys: selectedKeys,
      })
      setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)))
      selectUser(user)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save entitlements')
    } finally {
      setSaving(false)
    }
  }

  function togglePrivilege(key: string) {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    )
  }

  if (authStore.isLoading) {
    return <p className="text-center text-dashboard-muted">Loading…</p>
  }

  if (!authStore.isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  if (!authStore.isAdmin) {
    return (
      <div className="widget-card rounded-2xl border border-dashboard-border bg-dashboard-surface p-6 text-center">
        <p className="text-dashboard-text">Admin access required.</p>
        <Link to="/admin/login" className="mt-3 inline-block text-sm text-accent hover:text-accent-hover">
          Admin sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-dashboard-text">Admin</h1>
          <p className="text-sm text-dashboard-muted">
            Approve registrations and assign entitlements.
            {pendingCount > 0 ? (
              <span className="ml-1 text-warning">({pendingCount} pending)</span>
            ) : null}
          </p>
        </div>
        <AuthButton
          variant="secondary"
          disabled={initialLoading || refreshing}
          onClick={handleRefresh}
        >
          {refreshing ? 'Refreshing…' : 'Refresh list'}
        </AuthButton>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      {!hasLoaded && initialLoading ? (
        <p className="text-dashboard-muted">Loading users…</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <section className="widget-card rounded-2xl border border-dashboard-border bg-dashboard-surface p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-dashboard-muted">
                Users ({users.length})
              </h2>
              {refreshing ? (
                <span className="text-xs text-dashboard-muted">Updating…</span>
              ) : null}
            </div>
            {users.length === 0 ? (
              <p className="text-sm text-dashboard-muted">
                No users yet. Refresh after someone registers.
              </p>
            ) : (
              <ul className="max-h-[28rem] space-y-2 overflow-y-auto">
                {users.map((user) => (
                  <li key={user.id}>
                    <button
                      type="button"
                      onClick={() => selectUser(user)}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                        selectedId === user.id
                          ? 'border-accent bg-accent/10'
                          : 'border-dashboard-border hover:border-accent/40'
                      }`}
                    >
                      <p className="font-medium text-dashboard-text">{user.displayName}</p>
                      <p className="text-xs text-dashboard-muted">{user.email}</p>
                      <p className="mt-1 text-xs capitalize text-dashboard-muted">
                        Status: {user.status}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="widget-card rounded-2xl border border-dashboard-border bg-dashboard-surface p-4">
            {selectedUser ? (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-dashboard-text">
                    {selectedUser.displayName}
                  </h2>
                  <p className="text-sm text-dashboard-muted">{selectedUser.email}</p>
                  <p className="mt-1 text-sm capitalize">Status: {selectedUser.status}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedUser.status !== 'approved' ? (
                    <AuthButton disabled={saving} onClick={() => void updateStatus('approved')}>
                      Approve
                    </AuthButton>
                  ) : null}
                  {selectedUser.status !== 'rejected' ? (
                    <AuthButton
                      variant="danger"
                      disabled={saving}
                      onClick={() => void updateStatus('rejected')}
                    >
                      Reject
                    </AuthButton>
                  ) : null}
                  {selectedUser.status !== 'suspended' ? (
                    <AuthButton
                      variant="secondary"
                      disabled={saving}
                      onClick={() => void updateStatus('suspended')}
                    >
                      Suspend
                    </AuthButton>
                  ) : null}
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-semibold text-dashboard-text">Entitlements</h3>
                  <ul className="space-y-2">
                    {privileges.map((privilege) => (
                      <li key={privilege.id}>
                        <label className="flex cursor-pointer items-start gap-2 text-sm">
                          <input
                            type="checkbox"
                            className="mt-0.5"
                            checked={selectedKeys.includes(privilege.key)}
                            onChange={() => togglePrivilege(privilege.key)}
                          />
                          <span>
                            <span className="font-medium text-dashboard-text">{privilege.key}</span>
                            {privilege.description ? (
                              <span className="block text-xs text-dashboard-muted">
                                {privilege.description}
                              </span>
                            ) : null}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                  <AuthButton
                    className="mt-4"
                    disabled={saving}
                    onClick={() => void savePrivileges()}
                  >
                    Save entitlements
                  </AuthButton>
                </div>
              </div>
            ) : (
              <p className="text-dashboard-muted">Select a user.</p>
            )}
          </section>
        </div>
      )}
    </div>
  )
})
