import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, Bell, ChevronDown, ExternalLink, LogOut, Settings, UserRound } from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'
import { ADMIN_NAV } from '../constants/adminNav'

function useCurrentSectionLabel(): string {
  const { pathname } = useLocation()
  const match = ADMIN_NAV.find((item) =>
    item.end ? pathname === item.to : pathname.startsWith(item.to),
  )
  return match?.label ?? 'Admin Panel'
}

export function AdminHeader() {
  const { user, logout } = useAuth()
  const sectionLabel = useCurrentSectionLabel()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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
    <header className="h-16 flex items-center gap-4 px-6 md:px-8 bg-bg border-b border-border">
      <span className="text-sm font-medium text-heading">{sectionLabel}</span>

      <div className="hidden md:flex items-center gap-2 ml-4 px-3.5 py-2 rounded-xl bg-surface border border-border w-72">
        <Search className="w-4 h-4 text-text-dim" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent text-sm text-text placeholder:text-text-dim focus:outline-none flex-1"
        />
      </div>

      <div className="flex-1" />

      <Link
        to="/"
        className="hidden sm:flex items-center gap-1.5 text-xs text-text-muted hover:text-text transition-colors"
      >
        View site
        <ExternalLink className="w-3.5 h-3.5" />
      </Link>

      <button className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center text-text-muted hover:text-text transition-colors">
        <Bell className="w-4 h-4" />
      </button>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
          className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-border hover:border-accent-border transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-accent-bg flex items-center justify-center text-xs font-medium text-accent">
            {user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
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
              to="/profile"
              onClick={() => setIsMenuOpen(false)}
              role="menuitem"
              className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-text hover:bg-surface-2 transition-colors"
            >
              <UserRound className="w-4 h-4" />
              View profile
            </Link>
            <Link
              to="/admin/settings"
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