
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Menu,
  Bell,
  CircleHelp,
  LogOut,
} from 'lucide-react'
import { useAdvertiserAuth } from '@/app/providers/AdvertiserAuthProvider'

interface AdvertiserHeaderProps {
  onOpenMenu: () => void
}

function initialsOf(name: string): string {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
  return letters || 'AD'
}

export function AdvertiserHeader({
  onOpenMenu,
}: AdvertiserHeaderProps) {
  const { advertiser, logout } = useAdvertiserAuth()
  const navigate = useNavigate()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    await logout()
    navigate('/advertiser/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open advertiser navigation"
          className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            Advertiser Workspace
          </p>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Manage your advertising presence
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          aria-label="Advertising support"
          className="hidden rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
        >
          <CircleHelp className="h-5 w-5" />
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
        </button>

        <div className="hidden h-8 w-px bg-border sm:block" />

        <div className="flex items-center gap-2 rounded-xl p-1.5">
          <div
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary"
          >
            {initialsOf(advertiser?.businessName ?? '')}
          </div>

          <div className="hidden min-w-0 text-left sm:block">
            <p className="max-w-[160px] truncate text-xs font-semibold text-foreground">
              {advertiser?.businessName ?? 'Advertiser Account'}
            </p>
            <p className="max-w-[160px] truncate text-[11px] text-muted-foreground">
              {advertiser?.email ?? 'Workspace'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="inline-flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-60"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
          <span className="sr-only sm:hidden">Sign out</span>
        </button>
      </div>
    </header>
  )
}
