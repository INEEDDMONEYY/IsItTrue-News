
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Megaphone,
  Plus,
  Image,
  BarChart3,
  CreditCard,
  Building2,
  Settings,
  CircleHelp,
} from 'lucide-react'

interface AdvertiserSidebarProps {
  onNavigate?: () => void
}

const workspaceLinks = [
  {
    label: 'Overview',
    path: '/advertiser',
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: 'Campaigns',
    path: '/advertiser/campaigns',
    icon: Megaphone,
  },
  {
    label: 'Create Advertisement',
    path: '/advertiser/campaigns/new',
    icon: Plus,
  },
  {
    label: 'Ad Library',
    path: '/advertiser/library',
    icon: Image,
  },
  {
    label: 'Analytics',
    path: '/advertiser/analytics',
    icon: BarChart3,
  },
  {
    label: 'Billing',
    path: '/advertiser/billing',
    icon: CreditCard,
  },
]

const accountLinks = [
  {
    label: 'Business Profile',
    path: '/advertiser/profile',
    icon: Building2,
  },
  {
    label: 'Settings',
    path: '/advertiser/settings',
    icon: Settings,
  },
]

export function AdvertiserSidebar({
  onNavigate,
}: AdvertiserSidebarProps) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary/10 text-primary'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    }`

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-border bg-card">
      <div className="flex h-20 items-center gap-3 border-b border-border px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Megaphone className="h-5 w-5" />
        </div>

        <div>
          <p className="text-base font-bold tracking-tight text-foreground">
            IITNews
          </p>
          <p className="text-xs text-muted-foreground">
            Advertiser Portal
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-6">
        <div>
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Workspace
          </p>

          <div className="space-y-1">
            {workspaceLinks.map(({ label, path, icon: Icon, end }) => (
              <NavLink
                key={path}
                to={path}
                end={end}
                onClick={onNavigate}
                className={linkClass}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Account
          </p>

          <div className="space-y-1">
            {accountLinks.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                onClick={onNavigate}
                className={linkClass}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <div className="border-t border-border p-4">
        <a
          href="/contact"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <CircleHelp className="h-[18px] w-[18px]" />
          Advertising Support
        </a>

        <div className="mt-3 rounded-xl border border-border bg-muted/40 p-3">
          <p className="text-xs font-semibold text-foreground">
            Advertise with IITNews
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Connect your brand with readers through responsible advertising.
          </p>
        </div>
      </div>
    </aside>
  )
}
