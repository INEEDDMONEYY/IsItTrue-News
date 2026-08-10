import { Users, UserCheck, ShieldCheck, TrendingUp } from 'lucide-react'
import { useUsersList } from '../hooks/useUsersList'
import { StatCard } from '@/components/cards'

export function AdminDashboardPage() {
  const { data: users, isLoading, error } = useUsersList()

  const totalUsers = users?.length ?? 0
  const verifiedUsers = users?.filter((u) => u.isEmailVerified).length ?? 0
  const adminCount = users?.filter((u) => u.role === 'admin').length ?? 0

  return (
    <div>
      <h1 className="text-2xl font-semibold text-heading mb-1">Dashboard</h1>
      <p className="text-sm text-text-muted mb-6">
        Overview of platform users and activity.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={totalUsers} icon={Users} />
        <StatCard label="Verified Users" value={verifiedUsers} icon={UserCheck} />
        <StatCard label="Admins" value={adminCount} icon={ShieldCheck} />
        <StatCard label="Growth (30d)" value="—" icon={TrendingUp} />
      </div>

      <h2 className="text-lg font-semibold text-heading mb-3">All Users</h2>

      {isLoading && <p className="text-sm text-text-muted">Loading users...</p>}

      {error && (
        <p className="text-sm text-disputed">
          {error instanceof Error ? error.message : 'Failed to load users.'}
        </p>
      )}

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
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-card-border">
                  <td className="px-4 py-3 text-card-heading">{user.name}</td>
                  <td className="px-4 py-3 text-card-text-muted">{user.email}</td>
                  <td className="px-4 py-3 text-card-text-muted capitalize">{user.role}</td>
                  <td className="px-4 py-3 text-card-text-muted">
                    {user.isEmailVerified ? 'Yes' : 'No'}
                  </td>
                  <td className="px-4 py-3 text-card-text-muted">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}