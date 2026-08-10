
import {
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  ClipboardCheck,
  FileCheck2,
  FilePlus2,
  FileText,
  FolderLock,
  Handshake,
  LayoutDashboard,
  MessageSquare,
  PencilLine,
  SearchCheck,
  Settings,
  ShieldCheck,
  Target,
  TvMinimalPlay,
  Users,
  UserPen,
  Bookmark,
  Flag,
  CalendarDays,
  Bell,
  CircleHelp,
  IdCard,
  ScrollText,
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
export function getDashboardNav(
  role: string | undefined,
): DashboardNavItem[] {
  /**
   * Shared navigation available to every dashboard user.
   */
  const base: DashboardNavItem[] = [
    {
      label: 'Dashboard',
      to: '/dashboard',
      icon: LayoutDashboard,
      end: true,
    },
    {
      label: 'Bookmarks',
      to: '/dashboard/bookmarks',
      icon: Bookmark,
    },
    {
      label: 'My Comments',
      to: '/dashboard/comments',
      icon: MessageSquare,
    },
    {
      label: 'My Videos',
      to: '/dashboard/videos',
      icon: TvMinimalPlay,
    },
    {
      label: 'Notifications',
      to: '/dashboard/notifications',
      icon: Bell,
    },
    {
      label: 'Profile & Identity Verification',
      to: '/dashboard/profile',
      icon: IdCard,
    },
    {
      label: 'Help Center / Support',
      to: '/dashboard/help',
      icon: CircleHelp,
    },
    {
      label: 'Community Guidelines',
      to: '/dashboard/community-guidelines',
      icon: ScrollText,
    },
    {
      label: 'Settings',
      to: '/dashboard/settings',
      icon: Settings,
    },
  ]

  if (role === 'author') {
    return [
      ...base,

      // Writing & Submissions
      {
        label: 'My Articles',
        to: '/dashboard/articles',
        icon: FileText,
        end: true,
      },
      {
        label: 'New Article',
        to: '/dashboard/articles/new',
        icon: FilePlus2,
      },
      {
        label: 'My Drafts',
        to: '/dashboard/drafts',
        icon: PencilLine,
      },
      {
        label: 'Submission Queue',
        to: '/dashboard/submissions',
        icon: ClipboardCheck,
      },
      {
        label: 'Pitch Center',
        to: '/dashboard/pitches',
        icon: Target,
      },

      // Investigations & Verification
      {
        label: 'My Investigations',
        to: '/dashboard/investigations',
        icon: BriefcaseBusiness,
      },
      {
        label: 'Fact Checks',
        to: '/dashboard/fact-checks',
        icon: ShieldCheck,
      },
      {
        label: 'Source Library',
        to: '/dashboard/sources',
        icon: BookOpen,
      },
      {
        label: 'Evidence Vault',
        to: '/dashboard/evidence',
        icon: FolderLock,
      },

      // Collaboration
      {
        label: 'Collaboration Room',
        to: '/dashboard/collaboration',
        icon: UserPen,
      },

      // Published Work
      {
        label: 'Corrections & Updates',
        to: '/dashboard/corrections',
        icon: FileCheck2,
      },

      // Analytics
      {
        label: 'Analytics',
        to: '/dashboard/analytics',
        icon: BarChart3,
      },
    ]
  }

  if (role === 'editor') {
    return [
      ...base,

      // Editorial Workflow
      {
        label: 'Review Queue',
        to: '/dashboard/review',
        icon: FileText,
      },
      {
        label: 'Pending Approvals',
        to: '/dashboard/approvals',
        icon: ClipboardCheck,
      },
      {
        label: 'Flagged Articles',
        to: '/dashboard/flagged',
        icon: Flag,
      },
      {
        label: 'Editorial Calendar',
        to: '/dashboard/calendar',
        icon: CalendarDays,
      },
      {
        label: 'Team Assignments',
        to: '/dashboard/assignments',
        icon: Handshake,
      },

      // Corrections & Verification
      {
        label: 'Corrections Management',
        to: '/dashboard/corrections',
        icon: FileCheck2,
      },
      {
        label: 'Fact Check Oversight',
        to: '/dashboard/fact-checks',
        icon: ShieldCheck,
      },
      {
        label: 'Investigation Oversight',
        to: '/dashboard/investigations',
        icon: BriefcaseBusiness,
      },
      {
        label: 'Source Verification Tools',
        to: '/dashboard/source-verification',
        icon: SearchCheck,
      },

      // Performance & Quality
      {
        label: 'Author Performance Metrics',
        to: '/dashboard/authors/metrics',
        icon: Users,
      },
      {
        label: 'Content Quality Dashboard',
        to: '/dashboard/content-quality',
        icon: BarChart3,
      },
      {
        label: 'Analytics',
        to: '/dashboard/analytics',
        icon: BarChart3,
      },
    ]
  }

  // Reader (default)
  return base
}

