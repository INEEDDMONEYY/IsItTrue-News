
import {
  BarChart3,
  BookOpen,
  BookOpenText,
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
  Megaphone,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'

export interface DashboardNavItem {
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
  premium?: boolean
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
   * Navigation shared by every dashboard user. Readers don't get "My Videos"
   * or "Community Guidelines" (see readerBase below) — those two are only
   * spliced back in for authors/editors.
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
      label: 'Settings',
      to: '/dashboard/settings',
      icon: Settings,
    },
  ]

  // Only authors/editors get a video studio and are bound by the
  // author-facing community guidelines link.
  const videosAndGuidelines: DashboardNavItem[] = [
    {
      label: 'My Videos',
      to: '/dashboard/videos',
      icon: TvMinimalPlay,
    },
    {
      label: 'Community Guidelines',
      to: '/dashboard/community-guidelines',
      icon: ScrollText,
    },
  ]

  if (role === 'author') {
    return [
      ...base.slice(0, 3),
      ...videosAndGuidelines.slice(0, 1),
      ...base.slice(3, 6),
      ...videosAndGuidelines.slice(1),
      ...base.slice(6),

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
        premium: true,
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
        premium: true,
      },

      // Investigations & Verification
      {
        label: 'My Investigations',
        to: '/author/investigations',
        icon: BriefcaseBusiness,
        premium: true,
      },
      {
        label: 'New Investigation',
        to: '/author/investigations/new',
        icon: FilePlus2,
        premium: true,
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
        to: '/author/evidence',
        icon: FolderLock,
        premium: true,
      },

      // Collaboration
      {
        label: 'Collaboration Room',
        to: '/dashboard/collaboration',
        icon: UserPen,
        premium: true,
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
        premium: true,
      },
    ]
  }

  if (role === 'editor') {
    return [
      ...base.slice(0, 3),
      ...videosAndGuidelines.slice(0, 1),
      ...base.slice(3, 6),
      ...videosAndGuidelines.slice(1),
      ...base.slice(6),

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
        to: '/author/investigations/review-queue',
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

  // Reader (default) — no video studio / community guidelines, but with a
  // dedicated reading-experience settings page and a way to pitch coverage ideas.
  return [
    ...base.slice(0, -1),
    {
      label: 'Reader Settings',
      to: '/dashboard/reader-settings',
      icon: BookOpenText,
    },
    {
      label: 'Topic Submission',
      to: '/dashboard/topic-submission',
      icon: Megaphone,
    },
    {
      label: 'Become an Author',
      to: '/dashboard/become-author',
      icon: Sparkles,
    },
    ...base.slice(-1),
  ]
}

