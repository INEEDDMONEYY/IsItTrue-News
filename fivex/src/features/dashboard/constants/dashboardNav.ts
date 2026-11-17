
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
  PencilLine,
  Settings,
  ShieldCheck,
  Target,
  TvMinimalPlay,
  Users,
  UserPen,
  Flag,
  CalendarDays,
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
  children?: DashboardNavItem[]
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
    /**
     * Bookmarks will be added to the profile header nav and have it's own pages.
     * Bookmarks will only be accessible through the profile header and not the main dashboard nav.
     * Bookmarks can only be viewed by account holder (another users bookmarks will never be accessible).
    {
      label: 'Bookmarks',
      to: '/dashboard/bookmarks',
      icon: Bookmark,
    },
    */
    
    /** 
     * Comments can be moved to analytics overview page for all roles, all it's showing are the comment analytics.
     * View a comment through this page will be removed.
     * Comments will be refactored to only show analytics and metrics. 
    {
      label: 'My Comments',
      to: '/dashboard/comments',
      icon: MessageSquare,
    },
    */

    /*
    *Notifications will have a page link 'ALL notiffications' instead of being a nav item.
    *Notification toasts regarding workspace and article approvals will only be shown in dashboard page (This helps notifcations stay less annoying and more contextual).
    {
      label: 'Notifications',
      to: '/dashboard/notifications',
      icon: Bell,
    },
    */
    {
      label: 'Settings',
      to: '/dashboard/settings',
      icon: Settings,
    },
    // Following can be refactored, into the profile header. When number of following is toggled, it will display a page of the users that they follow.
    /** 
    {
      label: 'Following',
      to: '/dashboard/following',
      icon: Users,
    },

    */
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

        // Editorial Workspace: one group, so the hub and its oversight pages are nested under it
        {
          label: 'Editorial Workspace',
          to: '/dashboard/work-space',
          icon: Handshake,
          children: [
            { label: 'Workspace Hub', to: '/dashboard/work-space', icon: Handshake, end: true },
            /**The workflow stage can only be reviewing, fact-checking or scheduled. Published is set automatically and cannot be edited, and the editor cannot edit draft or submitted. The deadline is set from the workflow stage. */
            { label: 'Editorial Calendar', to: '/dashboard/calendar', icon: CalendarDays },
            { label: 'Workspace Review Queue', to: '/dashboard/review', icon: FileText },
            { label: 'Article Approvals', to: '/dashboard/approvals', icon: ClipboardCheck },
            { label: 'Fact Check Oversight', to: '/dashboard/fact-check-oversight', icon: ShieldCheck },
            { label: 'Investigation Oversight', to: '/dashboard/investigation-oversight', icon: BriefcaseBusiness },
            { label: 'Corrections Management', to: '/dashboard/corrections', icon: FileCheck2 },
            { label: 'Flagged Articles', to: '/dashboard/flagged', icon: Flag },
          ],
        },
         /**Source Verification is hidden until a source model exists (src/features/sources pages are empty, no backend module). */

        // Editorial Analytics: one group, so the analytics pages are nested rather than listed flat
        {
          label: 'Editorial Analytics',
          to: '/dashboard/analytics',
          icon: BarChart3,
          children: [
            { label: 'Overview', to: '/dashboard/analytics', icon: BarChart3, end: true },
            { label: 'Author Performance', to: '/dashboard/authors/metrics', icon: Users },
            { label: 'Content Quality', to: '/dashboard/content-quality', icon: FileCheck2 },
            { label: 'Editorial Workflow', to: '/dashboard/editorial-workflow', icon: ClipboardCheck },
            { label: 'Fact-Check Analytics', to: '/dashboard/fact-check-analytics', icon: ShieldCheck },
            { label: 'Investigation Analytics', to: '/dashboard/investigation-analytics', icon: BriefcaseBusiness },
            { label: 'Article Performance', to: '/dashboard/article-performance', icon: FileText },
            { label: 'Reports & Exports', to: '/dashboard/reports', icon: ScrollText },
          ],
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

export interface DashboardBreadcrumb {
  label: string
  to: string
}

const matchesPath = (item: DashboardNavItem, pathname: string) =>
  item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`)

/**
 * Builds the breadcrumb trail for the current path from the same tree the sidebar renders.
 * Groups always appear before their matched child, so Dashboard > Editorial Workspace > Workspace Hub
 * shows where a page sits in the hierarchy.
 */
export function getDashboardBreadcrumbs(role: string | undefined, pathname: string): DashboardBreadcrumb[] {
  const [root, ...items] = getDashboardNav(role)
  const trail: DashboardBreadcrumb[] = [{ label: root.label, to: root.to }]

  for (const item of items) {
    const child = item.children?.find((candidate) => matchesPath(candidate, pathname))
    if (child) {
      trail.push({ label: item.label, to: item.to }, { label: child.label, to: child.to })
      return trail
    }
    if (matchesPath(item, pathname)) {
      trail.push({ label: item.label, to: item.to })
      return trail
    }
  }

  return trail
}


