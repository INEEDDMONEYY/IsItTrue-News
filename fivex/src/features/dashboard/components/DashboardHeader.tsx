import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Bell, ChevronDown, ExternalLink, LogOut, Menu, Settings, UserRound } from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'
import { getDashboardNav } from '../constants/dashboardNav'
import { notificationsApi } from '@/features/notifications/api/notifications.api'
import { NOTIFICATIONS_QUERY_KEY } from '@/features/notifications/hooks/useNotifications'
import { UserAvatar } from './UserAvatar'

function useCurrentSectionLabel(role: string | undefined): string {
  const { pathname } = useLocation()
  const nav = getDashboardNav(role)
  const match = nav.find((item) => (item.end ? pathname === item.to : pathname.startsWith(item.to)))
  return match?.label ?? 'Dashboard'
}

export function DashboardHeader({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const { user, logout } = useAuth()
  const sectionLabel = useCurrentSectionLabel(user?.role)
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { data: notifications = [] } = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: notificationsApi.listMine,
    refetchInterval: 30_000,
  })
  const unreadCount = notifications.filter((notification) => !notification.read).length

  useEffect(() => {
    if (!isMenuOpen) return
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMenuOpen])

  const handleLogout = async () => {
    setIsMenuOpen(false)
    await logout()
    navigate('/login')
  }

  return (
    <header className="h-16 flex items-center gap-3 sm:gap-4 px-4 sm:px-6 md:px-8 bg-bg border-b border-border">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open navigation"
        className="md:hidden w-9 h-9 shrink-0 flex items-center justify-center rounded-xl border border-border text-text hover:bg-surface-2"
      >
        <Menu className="w-5 h-5" />
      </button>
      <span className="text-sm font-medium text-heading truncate">{sectionLabel}</span>

      <div className="flex-1" />

      <Link
        to="/"
        className="hidden sm:flex items-center gap-1.5 text-xs text-text-muted hover:text-text transition-colors"
      >
        View site
        <ExternalLink className="w-3.5 h-3.5" />
      </Link>

      <Link
        to="/dashboard/notifications"
        aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'}
        className="relative w-9 h-9 shrink-0 rounded-xl gradient-border-card flex items-center justify-center text-card-heading hover:text-accent transition-colors"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-disputed text-[10px] font-medium leading-4 text-white text-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
          className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full gradient-border-chip transition-colors"
        >
          <UserAvatar user={user} className="w-8 h-8 text-xs" />
          <span className="hidden sm:block text-sm text-text">{user?.name}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-text-muted transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isMenuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-[calc(100%+8px)] w-52 rounded-xl border border-border bg-surface shadow-lg py-1.5 z-20"
          >
            <div className="px-3.5 py-2 mb-1 border-b border-border">
              <p className="text-sm font-medium text-heading truncate">{user?.name}</p>
              <p className="text-xs text-text-dim truncate">{user?.email}</p>
            </div>
            <Link
              to={`/authors/${user?.id ?? ''}`}
              onClick={() => setIsMenuOpen(false)}
              role="menuitem"
              className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-text hover:bg-surface-2 transition-colors"
            >
              <UserRound className="w-4 h-4" />
              View profile
            </Link>
            <Link
              to="/dashboard/settings"
              onClick={() => setIsMenuOpen(false)}
              role="menuitem"
              className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-text hover:bg-surface-2 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Account settings
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              role="menuitem"
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-disputed hover:bg-surface-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
