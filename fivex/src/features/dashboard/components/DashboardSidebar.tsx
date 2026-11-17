import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'
import { isPremiumUser } from '@/features/billing/utils/plan'
import { FreePlanUsageWidget } from '@/features/readers/components/FreePlanUsageWidget'
import { getDashboardNav } from '../constants/dashboardNav'
import { useDashboardNavCounts } from '../hooks/useDashboardNavCounts'
import { DashboardNavEntry } from './DashboardNavEntry'
import { UserAvatar } from './UserAvatar'
import logo from '@/assets/icons/isittrue-icon-dark.jpg'

const COLLAPSE_STORAGE_KEY = 'itt-dashboard-sidebar-collapsed'

export function DashboardSidebar() {
  const { user } = useAuth()
  const nav = getDashboardNav(user?.role)
  const navCounts = useDashboardNavCounts()
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
        <img src={logo} alt="IsItTrueNews" className="w-8 h-8 rounded-lg object-cover shrink-0" />
        {!collapsed && <span className="font-semibold text-heading truncate">IsItTrueNews</span>}
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
        {nav.map((item) => (
          <DashboardNavEntry key={item.to} item={item} user={user} counts={navCounts} collapsed={collapsed} />
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
