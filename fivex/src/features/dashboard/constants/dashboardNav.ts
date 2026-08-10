import {
  BarChart3,
  BookMarked,
  FilePlus2,
  FileText,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'

export interface DashboardNavItem {
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
}

/**
 * Returns the sidebar nav for the shared /dashboard shell based on the
 * signed-in user's role. Admins never land here (they get /admin instead),
 * so only reader/author/editor are handled.
 */
export function getDashboardNav(role: string | undefined): DashboardNavItem[] {
  const base: DashboardNavItem[] = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, end: true },
  ]

  if (role === 'author') {
    return [
      ...base,
      { label: 'My Articles', to: '/dashboard/articles', icon: FileText, end: true },
      { label: 'New Article', to: '/dashboard/articles/new', icon: FilePlus2 },
      { label: 'Fact Checks', to: '/dashboard/fact-checks', icon: ShieldCheck },
      { label: 'Analytics', to: '/dashboard/analytics', icon: BarChart3 },
      { label: 'Settings', to: '/dashboard/settings', icon: Settings },
    ]
  }

  if (role === 'editor') {
    return [
      ...base,
      { label: 'Review Queue', to: '/dashboard/review', icon: FileText },
      { label: 'Fact Checks', to: '/dashboard/fact-checks', icon: ShieldCheck },
      { label: 'Analytics', to: '/dashboard/analytics', icon: BarChart3 },
      { label: 'Settings', to: '/dashboard/settings', icon: Settings },
    ]
  }

  // Reader (default)
  return [
    ...base,
    { label: 'Bookmarks', to: '/dashboard/bookmarks', icon: BookMarked },
    { label: 'Settings', to: '/dashboard/settings', icon: Settings },
  ]
}
