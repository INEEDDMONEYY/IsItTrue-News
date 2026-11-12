
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdvertiserAuth } from '../providers/AdvertiserAuthProvider'

export function AdvertiserRoute() {
  const { isAuthenticated, isLoading } = useAdvertiserAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white" />
          <p className="text-sm text-zinc-400">
            Loading advertiser portal...
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/advertiser/login"
        replace
        state={{ from: location }}
      />
    )
  }

  return <Outlet />
}
