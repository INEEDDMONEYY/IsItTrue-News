import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdvertiserAuth } from '../providers/AdvertiserAuthProvider'

export function AdvertiserRoute() {
  const { isAuthenticated, isLoading, hasSessionError, retrySession } = useAdvertiserAuth()
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

  // The API couldn't be reached, which says nothing about the session, so don't send them to sign in again.
  if (hasSessionError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b] px-6 text-center">
        <div className="max-w-sm">
          <p className="text-base font-semibold text-white">We couldn't reach the advertiser portal</p>
          <p className="mt-2 text-sm text-zinc-400">
            Check your connection and try again. This doesn't sign you out.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={retrySession}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-zinc-200"
            >
              Try again
            </button>
            <Link
              to="/"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/[0.06]"
            >
              View site
            </Link>
          </div>
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
