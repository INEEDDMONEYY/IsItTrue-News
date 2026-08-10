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
  FolderSearch,
  SearchCheck,
  Archive,
  BriefcaseBusiness,
  ClipboardList,
  FileWarning,
  Database,
  Video,
  Mail,
  ScrollText,
  ServerCog,
  type LucideIcon,
} from 'lucide-react'

export interface AdminNavItem {
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
}

export const ADMIN_NAV: AdminNavItem[] = [
  // Dashboard
  {
    label: 'Dashboard',
    to: '/admin',
    icon: LayoutDashboard,
    end: true,
  },

  // Content
  {
    label: 'Articles',
    to: '/admin/articles',
    icon: FileText,
  },
  {
    label: 'Case Files',
    to: '/admin/case-files',
    icon: FolderSearch,
  },
  {
    label: 'Investigations',
    to: '/admin/investigations',
    icon: BriefcaseBusiness,
  },

  // Verification
  {
    label: 'Fact Checks',
    to: '/admin/fact-checks',
    icon: BadgeCheck,
  },
  {
    label: 'Fact Check Verification',
    to: '/admin/fact-check-verification',
    icon: SearchCheck,
  },
  {
    label: 'Evidence',
    to: '/admin/evidence',
    icon: Archive,
  },
  {
    label: 'Sources',
    to: '/admin/sources',
    icon: Database,
  },

  // Operations
  {
    label: 'Reports',
    to: '/admin/reports',
    icon: FileWarning,
  },
  {
    label: 'Requests',
    to: '/admin/requests',
    icon: ClipboardList,
  },
  {
    label: 'Audit Logs',
    to: '/admin/audit-logs',
    icon: ScrollText,
  },
  {
    label: 'Moderation',
    to: '/admin/moderation',
    icon: ShieldAlert,
  },

  // Media
  {
    label: 'Videos',
    to: '/admin/videos',
    icon: Video,
  },

  // Communications & Promotion
  {
    label: 'Newsletter',
    to: '/admin/newsletter',
    icon: Mail,
  },
  {
    label: 'Banners',
    to: '/admin/banners',
    icon: Megaphone,
  },
  {
    label: 'Advertisement Codes',
    to: '/admin/advertisements',
    icon: Code2,
  },

  // Platform
  {
    label: 'Users',
    to: '/admin/users',
    icon: Users,
  },
  {
    label: 'CMS',
    to: '/admin/cms',
    icon: FileText,
  },
  {
    label: 'Analytics',
    to: '/admin/analytics',
    icon: BarChart3,
  },
  {
    label: 'SEO',
    to: '/admin/seo',
    icon: Globe,
  },
  {
    label: 'Article Categories',
    to: '/admin/categories',
    icon: Tags,
  },
  {
    label: 'Tickets',
    to: '/admin/tickets',
    icon: Ticket,
  },
  {
    label: 'System',
    to: '/admin/system',
    icon: ServerCog,
  },
  {
    label: 'Settings',
    to: '/admin/settings',
    icon: Settings,
  },
]