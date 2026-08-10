import { useEffect, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'
import { getDashboardNav } from '../constants/dashboardNav'
import logo from '@/assets/logos/isittrue-logo.jpg'

const COLLAPSE_STORAGE_KEY = 'itt-dashboard-sidebar-collapsed'

export function DashboardSidebar() {
  const { user } = useAuth()
  const nav = getDashboardNav(user?.role)
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === '1'
  })

  useEffect(() => {
    window.localStorage.setItem(COLLAPSE_STORAGE_KEY, collapsed ? '1' : '0')
  }, [collapsed])

  return (
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
        <img src={logo} alt="IsItTrue News" className="w-8 h-8 rounded-lg object-cover shrink-0" />
        {!collapsed && <span className="font-semibold text-heading truncate">IsItTrue News</span>}
      </Link>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {nav.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg text-sm transition-colors ${
                collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2'
              } ${
                isActive
                  ? 'bg-accent-bg text-accent font-medium'
                  : 'text-text-muted hover:text-text hover:bg-surface-2'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {!collapsed && label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <div className={`flex items-center gap-2 py-2 ${collapsed ? 'justify-center px-0' : 'px-3'}`}>
          <div className="w-7 h-7 rounded-full bg-accent-bg flex items-center justify-center text-xs font-medium text-accent shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm text-heading truncate">{user?.name}</p>
              <p className="text-xs text-text-dim truncate">{user?.email}</p>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed((v) => !v)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`w-full flex items-center gap-2.5 rounded-lg text-sm text-text-muted hover:text-text hover:bg-surface-2 transition-colors mt-1 ${
            collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2'
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
  )
}
