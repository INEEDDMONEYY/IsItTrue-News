import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, Lock } from 'lucide-react'
import type { useAuth } from '@/app/providers/AuthProvider'
import { hasPremiumAccess } from '@/features/billing/utils/plan'
import type { DashboardNavItem } from '../constants/dashboardNav'
import { NavCountBadge } from './NavCountBadge'

type AuthUser = ReturnType<typeof useAuth>['user']

interface DashboardNavEntryProps {
  item: DashboardNavItem
  user: AuthUser
  // Pending-work counts keyed by sidebar path. A group's badge is the sum of its children.
  counts?: Record<string, number>
  collapsed?: boolean
  // The desktop sidebar and the mobile drawer use slightly different row sizes.
  variant?: 'sidebar' | 'drawer'
}

const isPathActive = (pathname: string, to: string) => pathname === to || pathname.startsWith(`${to}/`)

const inactiveClass = 'text-text-muted hover:text-text hover:bg-surface-2'
const activeClass = 'bg-brand-gradient text-on-brand font-medium'

// Renders one top-level nav item. Items with children become an expandable group; when the sidebar is
// collapsed to icons, the group collapses to a single icon link to its parent route.
export function DashboardNavEntry({ item, user, counts = {}, collapsed = false, variant = 'sidebar' }: DashboardNavEntryProps) {
  const { pathname } = useLocation()
  const { label, to, icon: Icon, end, premiumFeature, children } = item
  const ownCount = counts[to] ?? 0
  const groupCount = children?.reduce((sum, child) => sum + (counts[child.to] ?? 0), 0) ?? 0
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
            <span className="flex items-center gap-1.5">
              <NavCountBadge count={groupCount} />
              <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </span>
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
                <span className="flex items-center justify-between gap-2">
                  {child.label}
                  <NavCountBadge count={counts[child.to] ?? 0} />
                </span>
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
      <span className="relative shrink-0">
        <Icon className="w-4 h-4" />
        {collapsed && ownCount > 0 && (
          <span className="absolute -right-2 -top-2">
            <NavCountBadge count={ownCount} className="bg-brand-gradient text-on-brand ring-2 ring-surface" />
          </span>
        )}
      </span>
      {!collapsed && (
        <span className="flex flex-1 items-center justify-between gap-2 truncate">
          {label}
          <span className="flex items-center gap-1.5">
            {locked && <Lock className="w-3.5 h-3.5 shrink-0 text-text-dim" />}
            <NavCountBadge count={ownCount} />
          </span>
        </span>
      )}
    </NavLink>
  )
}
