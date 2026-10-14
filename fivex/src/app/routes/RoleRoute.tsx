import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'

interface RoleRouteProps {
  roles: string[]
  // Where everyone else is sent.
  redirectTo: string
}

/**
 * Limits a group of routes (inside an already-protected area) to specific roles. A UX convenience only; the
 * server remains the security boundary.
 */
export function RoleRoute({ roles, redirectTo }: RoleRouteProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="flex min-h-[40vh] items-center justify-center text-sm text-text-muted">Loading...</div>
  }

  if (!user || !roles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}
