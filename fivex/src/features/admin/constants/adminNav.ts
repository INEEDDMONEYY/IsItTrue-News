import {
  LayoutDashboard,
  Users,
  FileText,
  ShieldAlert,
  BarChart3,
  Settings,
  Megaphone,
  Code2,
  Globe,
  Tags,
  Ticket,
  BadgeCheck,
  type LucideIcon,
} from 'lucide-react'

export interface AdminNavItem {
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
}

export const ADMIN_NAV: AdminNavItem[] = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'CMS', to: '/admin/cms', icon: FileText },
  { label: 'Moderation', to: '/admin/moderation', icon: ShieldAlert },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
  { label: 'Banners', to: '/admin/banners', icon: Megaphone },
  { label: 'Advertisement Codes', to: '/admin/advertisements', icon: Code2 },
  { label: 'SEO', to: '/admin/seo', icon: Globe },
  { label: 'Article Categories', to: '/admin/categories', icon: Tags },
  { label: 'Tickets', to: '/admin/tickets', icon: Ticket },
  { label: 'Fact Check Verification', to: '/admin/fact-check-verification', icon: BadgeCheck },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
]

