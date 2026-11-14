
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'
import { ADMIN_NAV } from '../constants/adminNav'
import logo from '@/assets/icons/isittrue-icon-dark.jpg'

const COLLAPSE_STORAGE_KEY = 'itt-admin-sidebar-collapsed'

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const { user } = useAuth()

  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === '1'
  })

  useEffect(() => {
    window.localStorage.setItem(
      COLLAPSE_STORAGE_KEY,
      collapsed ? '1' : '0',
    )
  }, [collapsed])

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const renderNavigation = (isCollapsed = false) => (
    <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
      {ADMIN_NAV.map(({ label, to, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          title={isCollapsed ? label : undefined}
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-2.5 rounded-lg text-sm transition-colors ${
              isCollapsed
                ? 'justify-center px-0 py-2.5'
                : 'px-3 py-2'
            } ${
              isActive
                ? 'bg-accent-bg text-accent font-medium'
                : 'text-text-muted hover:text-text hover:bg-surface-2'
            }`
          }
        >
          <Icon className="w-4 h-4 shrink-0" />
          {!isCollapsed && label}
        </NavLink>
      ))}
    </nav>
  )

  const renderUser = (isCollapsed = false) => (
    <div
      className={`flex items-center gap-2 py-2 ${
        isCollapsed ? 'justify-center px-0' : 'px-3'
      }`}
    >
      <div className="w-7 h-7 rounded-full bg-accent-bg flex items-center justify-center text-xs font-medium text-accent shrink-0">
        {user?.name?.[0]?.toUpperCase() ?? '?'}
      </div>

      {!isCollapsed && (
        <div className="min-w-0">
          <p className="text-sm text-heading truncate">{user?.name}</p>
          <p className="text-xs text-text-dim truncate">{user?.email}</p>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex shrink-0 flex-col bg-surface border-r border-border transition-[width] duration-200 ${
          collapsed ? 'w-[72px]' : 'w-60'
        }`}
      >
        <Link
          to="/"
          className={`flex items-center gap-2.5 h-16 border-b border-border ${
            collapsed ? 'justify-center px-2' : 'px-5'
          }`}
        >
          <img
            src={logo}
            alt="IsItTrue News"
            className="w-8 h-8 rounded-lg object-cover shrink-0"
          />
          {!collapsed && (
            <span className="font-semibold text-heading truncate">
              IsItTrue News
            </span>
          )}
        </Link>

        {renderNavigation(collapsed)}

        <div className="px-3 py-4 border-t border-border">
          {renderUser(collapsed)}

          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`w-full flex items-center gap-2.5 rounded-lg text-sm text-text-muted hover:text-text hover:bg-surface-2 transition-colors mt-1 ${
              collapsed
                ? 'justify-center px-0 py-2.5'
                : 'px-3 py-2'
            }`}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-4 h-4 shrink-0" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4 shrink-0" />
                Collapse
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile drawer backdrop */}
      <button
        type="button"
        aria-label="Close admin navigation"
        tabIndex={isOpen ? 0 : -1}
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen
            ? 'opacity-100 visible'
            : 'opacity-0 invisible pointer-events-none'
        }`}
      />

      {/* Mobile drawer */}
      <aside
        id="admin-mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Admin navigation"
        aria-hidden={!isOpen}
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-[min(340px,88vw)] flex-col bg-surface border-r border-border shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-5 border-b border-border shrink-0">
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center gap-2.5 min-w-0"
          >
            <img
              src={logo}
              alt="IsItTrue News"
              className="w-8 h-8 rounded-lg object-cover shrink-0"
            />
            <span className="font-semibold text-heading truncate">
              IsItTrue News
            </span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {renderNavigation()}

        <div className="px-3 py-4 border-t border-border shrink-0">
          {renderUser()}
        </div>
      </aside>
    </>
  )
}
