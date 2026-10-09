import { useEffect } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { Lock, X } from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'
import { hasPremiumAccess } from '@/features/billing/utils/plan'
import { getDashboardNav } from '../constants/dashboardNav'
import { UserAvatar } from './UserAvatar'
import logo from '@/assets/icons/question-icon-removebg.png'

interface MobileNavDrawerProps {
  open: boolean
  onClose: () => void
}

// The desktop sidebar is hidden below md, so this is the only way to reach the nav on phones/tablets.
export function MobileNavDrawer({ open, onClose }: MobileNavDrawerProps) {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const nav = getDashboardNav(user?.role)

  useEffect(() => {
    onClose()
    // Close after navigating; onClose identity changes are irrelevant here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  return (
    <div className={`md:hidden fixed inset-0 z-40 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}
      />

      <aside
        role="dialog"
        aria-label="Dashboard navigation"
        className={`absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-surface border-r border-border shadow-xl transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <img src={logo} alt="IsItTrue News" className="w-8 h-8 rounded-lg object-cover shrink-0" />
            <span className="font-semibold text-heading truncate">IsItTrue News</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-text-muted hover:bg-surface-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
          {nav.map(({ label, to, icon: Icon, end, premiumFeature }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-brand-gradient text-on-brand font-medium'
                    : 'text-text-muted hover:text-text hover:bg-surface-2'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex flex-1 items-center justify-between gap-2">
                {label}
                {premiumFeature && !hasPremiumAccess(user, premiumFeature) && (
                  <Lock className="w-3.5 h-3.5 shrink-0 text-text-dim" />
                )}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 border-t border-border px-5 py-4">
          <UserAvatar user={user} className="w-8 h-8 text-xs shrink-0" />
          <div className="min-w-0">
            <p className="text-sm text-heading truncate">{user?.name}</p>
            <p className="text-xs text-text-dim truncate">{user?.email}</p>
          </div>
        </div>
      </aside>
    </div>
  )
}
