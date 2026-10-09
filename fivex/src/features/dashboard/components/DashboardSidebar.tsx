import { useEffect, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Lock, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'
import { hasPremiumAccess, isPremiumUser } from '@/features/billing/utils/plan'
import { FreePlanUsageWidget } from '@/features/readers/components/FreePlanUsageWidget'
import { getDashboardNav } from '../constants/dashboardNav'
import { UserAvatar } from './UserAvatar'
import logo from '@/assets/icons/question-icon-removebg.png'

const COLLAPSE_STORAGE_KEY = 'itt-dashboard-sidebar-collapsed'

export function DashboardSidebar() {
  const { user } = useAuth()
  const nav = getDashboardNav(user?.role)
  const premium = isPremiumUser(user)
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === '1'
  })

  useEffect(() => {
    window.localStorage.setItem(COLLAPSE_STORAGE_KEY, collapsed ? '1' : '0')
  }, [collapsed])

  return (
    <aside
      className={`hidden md:flex sticky top-0 h-screen shrink-0 flex-col bg-surface border-r border-border transition-[width] duration-200 ${
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
        {!collapsed && <span className="font-semibold text-heading truncate">IsItTrueNews</span>}
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
        {nav.map(({ label, to, icon: Icon, end, premiumFeature }) => (
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
                  ? 'bg-brand-gradient text-on-brand font-medium'
                  : 'text-text-muted hover:text-text hover:bg-surface-2'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {!collapsed && (
              <span className="flex flex-1 items-center justify-between gap-2 truncate">
                {label}
                {premiumFeature && !hasPremiumAccess(user, premiumFeature) && (
                  <Lock className="w-3.5 h-3.5 shrink-0 text-text-dim" />
                )}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        {!collapsed && user?.role === 'reader' && !premium && <FreePlanUsageWidget />}

        <div className={`flex items-center gap-2 py-2 ${collapsed ? 'justify-center px-0' : 'px-3'}`}>
          <UserAvatar user={user} className="w-7 h-7 text-xs shrink-0" />
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
