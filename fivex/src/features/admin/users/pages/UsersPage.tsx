import { useMemo, useState } from 'react'
import { Search, Trash2 } from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { useUsersList } from '../../hooks/useUsersList'
import { useDeleteUser, useUpdateUserRole } from '../../hooks/useUserMutations'
import { USER_ROLE_OPTIONS, type UserRole } from '../../types/user.types'

export function UsersPage() {
  const { user: currentUser } = useAuth()
  const { data: users, isLoading, error } = useUsersList()
  const updateRole = useUpdateUserRole()
  const deleteUser = useDeleteUser()

  const [search, setSearch] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  const filteredUsers = useMemo(() => {
    if (!users) return []
    const query = search.trim().toLowerCase()
    if (!query) return users
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query),
    )
  }, [users, search])

  const handleRoleChange = (userId: string, role: UserRole) => {
    setActionError(null)
    updateRole.mutate(
      { userId, role },
      { onError: (err) => setActionError(getErrorMessage(err)) },
    )
  }

  const handleDelete = (userId: string, name: string) => {
    if (!window.confirm(`Delete ${name}'s account? This cannot be undone.`)) return
    setActionError(null)
    deleteUser.mutate(userId, { onError: (err) => setActionError(getErrorMessage(err)) })
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-heading mb-1">Users</h1>
      <p className="text-sm text-text-muted mb-6">
        Manage every registered account, update roles, and remove accounts.
      </p>

      <div className="relative max-w-xs mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-border bg-bg text-sm text-heading placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent-border"
        />
      </div>

      {isLoading && <p className="text-sm text-text-muted">Loading users...</p>}

      {error && <p className="text-sm text-disputed">{getErrorMessage(error, 'Failed to load users.')}</p>}

      {actionError && <p className="text-sm text-disputed mb-3">{actionError}</p>}

      {users && (
        <div className="overflow-x-auto rounded-xl border border-card-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-card-2 text-left text-card-text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Verified</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t border-card-border">
                  <td className="px-4 py-3 text-card-heading">{user.name}</td>
                  <td className="px-4 py-3 text-card-text-muted">{user.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      disabled={updateRole.isPending}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                      className="rounded-lg border border-card-border bg-card px-2 py-1 text-xs text-card-heading capitalize focus:outline-none focus:ring-2 focus:ring-accent-border disabled:opacity-50"
                    >
                      {USER_ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-card-text-muted">
                    {user.isEmailVerified ? 'Yes' : 'No'}
                  </td>
                  <td className="px-4 py-3 text-card-text-muted">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled={user.id === currentUser?.id || deleteUser.isPending}
                      onClick={() => handleDelete(user.id, user.name)}
                      title={
                        user.id === currentUser?.id
                          ? 'Use Settings to delete your own account'
                          : 'Delete account'
                      }
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-disputed hover:bg-surface-2 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-card-text-muted">
                    No users match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
