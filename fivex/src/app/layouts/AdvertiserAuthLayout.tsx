    
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdvertiserAuth } from '../providers/AdvertiserAuthProvider'

// Pages an emailed link lands on: they must work even if the advertiser happens to be signed in already.
const OPEN_TO_SIGNED_IN = ['/advertiser/verify-email', '/advertiser/reset-password']

export function AdvertiserAuthLayout() {
  const { isAuthenticated, isLoading } = useAdvertiserAuth()
  const { pathname } = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white" />
      </div>
    )
  }

  if (isAuthenticated && !OPEN_TO_SIGNED_IN.includes(pathname)) {
    return <Navigate to="/advertiser" replace />
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#09090b] text-white">
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-white/[0.04] blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-white/[0.08] px-5 py-5 sm:px-8">
        <Link
          to="/"
          className="flex items-center gap-3"
          aria-label="Return to IITNews"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-sm font-bold tracking-tight">
            IIT
          </span>

          <span className="flex flex-col">
            <span className="text-sm font-semibold tracking-wide">
              Is It True
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
              Advertiser Portal
            </span>
          </span>
        </Link>

        <Link
          to="/"
          className="text-xs font-medium text-zinc-400 transition-colors hover:text-white sm:text-sm"
        >
          Return to IITNews
        </Link>
      </header>

      {/* Authentication content */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12 sm:px-6 sm:py-16">
        <div className="w-full max-w-[440px]">
          <div className="rounded-2xl border border-white/[0.09] bg-[#111113] p-5 shadow-2xl shadow-black/30 sm:rounded-3xl sm:p-9">
            <Outlet />
          </div>

          <p className="mt-7 text-center text-xs leading-relaxed text-zinc-600">
            A dedicated advertising platform by Is It True.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.08] px-5 py-5 text-center">
        <p className="text-[11px] text-zinc-600">
          © {new Date().getFullYear()} Is It True. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
