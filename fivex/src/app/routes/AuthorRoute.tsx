import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'

/**
 * Route guard for the private Investigation Workspace (/author/*) —
 * author/editor/admin only. Plain readers are redirected home; this is a
 * UX convenience only, the actual security boundary is server-side
 * (authenticate + authorize('author', 'editor', 'admin') on every route).
 */
export function AuthorRoute() {
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

  if (user?.role !== 'author' && user?.role !== 'editor' && user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
