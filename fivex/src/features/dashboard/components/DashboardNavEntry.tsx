import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, Lock } from 'lucide-react'
import type { useAuth } from '@/app/providers/AuthProvider'
import { hasPremiumAccess } from '@/features/billing/utils/plan'
import type { DashboardNavItem } from '../constants/dashboardNav'

type AuthUser = ReturnType<typeof useAuth>['user']

interface DashboardNavEntryProps {
  item: DashboardNavItem
  user: AuthUser
  collapsed?: boolean
  // The desktop sidebar and the mobile drawer use slightly different row sizes.
  variant?: 'sidebar' | 'drawer'
}

const isPathActive = (pathname: string, to: string) => pathname === to || pathname.startsWith(`${to}/`)

const inactiveClass = 'text-text-muted hover:text-text hover:bg-surface-2'
const activeClass = 'bg-brand-gradient text-on-brand font-medium'

// Renders one top-level nav item. Items with children become an expandable group; when the sidebar is
// collapsed to icons, the group collapses to a single icon link to its parent route.
export function DashboardNavEntry({ item, user, collapsed = false, variant = 'sidebar' }: DashboardNavEntryProps) {
  const { pathname } = useLocation()
  const { label, to, icon: Icon, end, premiumFeature, children } = item
  const containsActive = children?.some((child) => isPathActive(pathname, child.to)) ?? false
  const [expanded, setExpanded] = useState(containsActive)
  const [wasActive, setWasActive] = useState(containsActive)

  // Opens the group when navigation lands inside it, so the current page is always visible in the tree.
  if (containsActive !== wasActive) {
    setWasActive(containsActive)
    if (containsActive) setExpanded(true)
  }

  const rowLayout = 'flex items-center gap-2.5 rounded-lg text-sm transition-colors'
  const rowPadding = collapsed
    ? 'justify-center px-0 py-2.5'
    : variant === 'drawer'
      ? 'px-3 py-2.5'
      : 'px-3 py-2'
  const locked = Boolean(premiumFeature && !hasPremiumAccess(user, premiumFeature))

  if (children && children.length > 0 && !collapsed) {
    return (
      <div>
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
          className={`${rowLayout} ${rowPadding} w-full ${containsActive ? 'text-heading font-medium' : inactiveClass}`}
        >
          <Icon className="w-4 h-4 shrink-0" />
          <span className="flex flex-1 items-center justify-between gap-2 truncate">
            {label}
            <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </span>
        </button>
        {expanded && (
          <div className="mt-0.5 flex flex-col gap-0.5">
            {children.map((child) => (
              <NavLink
                key={child.to}
                to={child.to}
                end={child.end}
                className={({ isActive }) =>
                  `block rounded-lg py-1.5 pl-9 pr-3 text-sm transition-colors ${isActive ? activeClass : inactiveClass}`
                }
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      className={({ isActive }) => `${rowLayout} ${rowPadding} ${isActive ? activeClass : inactiveClass}`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {!collapsed && (
        <span className="flex flex-1 items-center justify-between gap-2 truncate">
          {label}
          {locked && <Lock className="w-3.5 h-3.5 shrink-0 text-text-dim" />}
        </span>
      )}
    </NavLink>
  )
}
