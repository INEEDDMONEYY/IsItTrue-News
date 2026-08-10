import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'

/**
 * Route guard for admin-only pages. A signed-in non-admin is redirected home
 * instead of to /login (they ARE authenticated, they just lack permission) —
 * this is the client-side half of admin protection; every admin API route is
 * also independently guarded server-side via authenticate + authorize('admin'),
 * so this check is a UX convenience, not the actual security boundary.
 */
export function AdminRoute() {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-text-muted">
        Loading...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
