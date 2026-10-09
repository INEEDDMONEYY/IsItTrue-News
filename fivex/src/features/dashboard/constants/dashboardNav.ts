
import {
  BarChart3,
  BookOpen,
  BookOpenText,
  BriefcaseBusiness,
  ClipboardCheck,
  CreditCard,
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
  Megaphone,
  ScrollText,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import type { PremiumFeatureKey } from '@/features/billing/constants/premiumFeatures'

export interface DashboardNavItem {
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
  // Shows a lock until the user has access to this paywalled feature.
  premiumFeature?: PremiumFeatureKey
}

/**
 * Returns the sidebar nav for the shared /dashboard shell based on the
 * signed-in user's role. Admins never land here (they get /admin instead),
 * so only reader/author/editor are handled.
 */
const sortByLabel = (items: DashboardNavItem[]) =>
  [...items].sort((a, b) => a.label.localeCompare(b.label))

export function getDashboardNav(
  role: string | undefined,
): DashboardNavItem[] {
  const dashboardItem: DashboardNavItem = {
    label: 'Dashboard',
    to: '/dashboard',
    icon: LayoutDashboard,
    end: true,
  }

  /**
   * Navigation shared by every dashboard user. Readers don't get "My Videos"
   * or "Community Guidelines" (see videosAndGuidelines below) — those two are
   * only mixed in for authors/editors.
   */
  const shared: DashboardNavItem[] = [
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
    {
      label: 'Following',
      to: '/dashboard/following',
      icon: Users,
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
  ]

  if (role === 'author') {
    return [
      dashboardItem,
      ...sortByLabel([
        ...shared,
        ...videosAndGuidelines,

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
          premiumFeature: 'drafts',
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
          premiumFeature: 'pitchCenter',
        },

        // Investigations & Verification
        {
          label: 'My Investigations',
          to: '/author/investigations',
          icon: BriefcaseBusiness,
          premiumFeature: 'investigations',
        },
        {
          label: 'New Investigation',
          to: '/author/investigations/new',
          icon: FilePlus2,
          premiumFeature: 'investigations',
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
          premiumFeature: 'evidenceVault',
        },

        // Collaboration
        {
          label: 'Collaboration Room',
          to: '/dashboard/collaboration',
          icon: UserPen,
          premiumFeature: 'collaboration',
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
          premiumFeature: 'analytics',
        },
      ]),
    ]
  }

  if (role === 'editor') {
    return [
      dashboardItem,
      ...sortByLabel([
        ...shared,
        ...videosAndGuidelines,

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
          to: '/dashboard/fact-check-oversight',
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
      ]),
    ]
  }

  if (role === 'organization') {
    return [
      dashboardItem,
      ...sortByLabel([
        ...shared,
        {
          label: 'Team Seats',
          to: '/dashboard/organization/seats',
          icon: Users,
        },
        {
          label: 'Billing & Plans',
          to: '/dashboard/organization/billing',
          icon: CreditCard,
        },
      ]),
    ]
  }

  // Reader (default) — no video studio but with a
  // dedicated reading-experience settings page and a way to pitch coverage ideas.
  return [
    dashboardItem,
    ...sortByLabel([
      ...shared,
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
      {
        label: 'Become An Editor',
        to: '/dashboard/become-editor',
        icon: ClipboardCheck,
      },
      {
        label: 'Unlocked Articles',
        to: '/dashboard/unlocked-articles',
        icon: ScrollText,
      },
    ]),
  ]
}

