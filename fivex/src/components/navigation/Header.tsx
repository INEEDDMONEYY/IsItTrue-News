
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  Search,
  Menu,
  X,
  MapPin,
  ChevronDown,
  Sun,
  Moon,
  Monitor,
  CalendarDays,
  Globe2,
  UserRound,
  LogIn,
  Newspaper,
} from 'lucide-react'
import { Drawer } from '@animate-ui/react/primitives/base-ui/drawer'

import { useAuth } from '@/app/providers/AuthProvider'
import { useAdvertiserAuth } from '@/app/providers/AdvertiserAuthProvider'
import { useTheme } from '@/app/providers/ThemeProvider'
import { SearchBar } from '@/features/search/components/SearchBar'
import { CategoryChipBar } from './CategoryChipBar'
import { LocationModal } from '@/features/locations/components/LocationModal'
import { useReaderLocation } from '@/features/locations/hooks/useReaderLocation'
import { GLOBAL_LOCATION_ID } from '@/features/locations/types/location.types'

import logo from '@/assets/icons/isittrue-icon-dark.jpg'
import animatedLogo from '@/assets/isittrue-profile-animation.svg'

const NAV_LINKS = [
  { label: 'Home', to: '/', description: 'Latest headlines and updates' },
  { label: 'For You', to: '/for-you', description: 'News selected for your interests' },
  { label: 'Local', to: '/local', description: 'Stories happening near you' },
  { label: 'Fact Checks', to: '/fact-checks', description: 'Examine claims and evidence' },
  { label: 'Investigations', to: '/investigations', description: 'Explore in-depth reporting' },
  { label: 'Videos', to: '/videos', description: 'Watch reports and explainers' },
  { label: 'Newsletters', to: '/newsletter', description: 'News delivered to your inbox' },
]

function getFormattedDate() {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date())
}

export function Header() {
  const { isAuthenticated, user } = useAuth()
  const { isAuthenticated: isAdvertiserAuthenticated } = useAdvertiserAuth()
  const { theme, setTheme } = useTheme()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [locationOpen, setLocationOpen] = useState(false)
  const reader = useReaderLocation()
  const locationLabel =
    reader.location?.name ?? (reader.preference.locationId === GLOBAL_LOCATION_ID ? 'Global edition' : 'Set Location')

  const closeMobileMenu = () => setMobileOpen(false)

  return (
    <header className="sticky top-0 z-50 bg-bg">
      {/* Desktop utility bar */}
      <div className="hidden border-b border-border bg-surface md:block">
        <div className="mx-auto flex h-9 max-w-[1400px] items-center justify-between px-4 text-xs text-text-dim md:px-8">
          <div className="flex items-center gap-4">
            <span>Theme:</span>

            {(['light', 'dark', 'system'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                className={`transition-colors ${
                  theme === value
                    ? 'font-semibold text-heading'
                    : 'hover:text-text'
                }`}
              >
                {value === 'system' ? 'Auto' : value === 'light' ? 'Light' : 'Dark'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <span>{getFormattedDate()}</span>

            <button
              type="button"
              className="flex items-center gap-1 transition-colors hover:text-text"
              onClick={() => setLocationOpen(true)}
            >
              <MapPin className="h-3.5 w-3.5" />
              {locationLabel}
            </button>

            <button
              type="button"
              className="flex items-center gap-1 transition-colors hover:text-text"
            >
              US Edition
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 md:gap-4 md:px-8">
          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            className="-ml-2 rounded-lg p-2 text-text-muted transition-colors hover:bg-surface hover:text-heading md:hidden"
            onClick={() => setMobileOpen((value) => !value)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          <Link to="/" className="flex shrink-0 items-center gap-2">
            <picture>
              <source media="(prefers-reduced-motion: reduce)" srcSet={logo} />
              <img
                src={animatedLogo}
                alt="IsItTrue"
                width={40}
                height={40}
                className="size-10 rounded-lg ring-1 ring-border"
              />
            </picture>

            <span className="hidden text-lg font-semibold tracking-tight text-heading sm:block">
              IsItTrueNews
            </span>
          </Link>

          <nav className="ml-2 hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `text-sm transition-colors ${
                    isActive
                      ? 'font-medium text-heading'
                      : 'text-text-muted hover:text-text'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex-1" />

          <SearchBar className="hidden w-64 lg:block" />

          <button
            type="button"
            aria-label="Search"
            aria-expanded={mobileSearchOpen}
            onClick={() => setMobileSearchOpen((value) => !value)}
            className="rounded-full p-2 text-text-muted transition-colors hover:bg-surface hover:text-text lg:hidden"
          >
            {mobileSearchOpen ? (
              <X className="h-[18px] w-[18px]" />
            ) : (
              <Search className="h-[18px] w-[18px]" />
            )}
          </button>

          {isAdvertiserAuthenticated ? (
            <Link
    to="/advertiser"
    className="hidden items-center whitespace-nowrap text-xs font-semibold text-text-muted transition-colors hover:text-accent sm:inline-flex lg:text-sm"
  >
    Advertiser Dashboard
  </Link>
          ) : (
            <Link
              to="/subscribe"
              className="hidden rounded-lg bg-heading px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90 sm:inline-flex"
            >
              Subscribe
            </Link>
          )}

          {isAuthenticated ? (
            <Link
              to={user?.role === 'admin' ? '/admin' : '/dashboard'}
              className="hidden items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3 transition-colors hover:border-accent-border sm:flex"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-300 text-xs font-medium text-white">
                {user?.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <span className="text-sm text-text">{user?.name}</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="hidden rounded-lg border border-border px-4 py-2 text-sm font-medium text-heading transition-colors hover:border-accent-border hover:text-accent sm:inline-flex"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile search */}
        {mobileSearchOpen && (
          <div className="border-t border-border bg-bg px-4 py-3 lg:hidden">
            <SearchBar
              autoFocus
              onNavigate={() => setMobileSearchOpen(false)}
            />
          </div>
        )}

        {/* Mobile navigation drawer */}
        <Drawer.Root
          open={mobileOpen}
          onOpenChange={setMobileOpen}
          swipeDirection="left"
        >
          <Drawer.Portal>
            <Drawer.Backdrop className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[3px]" />

            <Drawer.Viewport className="fixed inset-0 z-[61] md:hidden">
              <Drawer.Popup className="fixed inset-y-0 left-0 flex w-[340px] max-w-[88vw] flex-col overflow-hidden border-r border-border bg-bg shadow-2xl">
                <Drawer.Content className="flex h-full min-h-0 flex-col">
                  {/* Drawer brand header */}
                  <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-5">
                    <Link
                      to="/"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3"
                    >
                      <picture>
                        <source
                          media="(prefers-reduced-motion: reduce)"
                          srcSet={logo}
                        />
                        <img
                          src={animatedLogo}
                          alt="IsItTrue"
                          className="h-11 w-11 rounded-xl ring-1 ring-border"
                        />
                      </picture>

                      <div>
                        <p className="text-base font-bold tracking-tight text-heading">
                          IsItTrueNews
                        </p>
                        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-dim">
                          Independent journalism
                        </p>
                      </div>
                    </Link>

                    <button
                      type="button"
                      aria-label="Close navigation"
                      onClick={closeMobileMenu}
                      className="rounded-xl border border-border p-2 text-text-muted transition-colors hover:bg-surface hover:text-heading"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    <Drawer.Title className="sr-only">
                      Main navigation
                    </Drawer.Title>
                  </div>

                  {/* Date and edition */}
                  <div className="shrink-0 border-b border-border bg-surface/70 px-5 py-4">
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <CalendarDays className="h-3.5 w-3.5 text-accent" />
                      <span>{getFormattedDate()}</span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        className="flex min-w-0 items-center justify-center gap-2 rounded-xl border border-border bg-bg px-3 py-2.5 text-xs font-medium text-heading transition-colors hover:border-accent-border"
                        onClick={() => setLocationOpen(true)}
                      >
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" />
                        {locationLabel}
                      </button>

                      <button
                        type="button"
                        className="flex min-w-0 items-center justify-center gap-2 rounded-xl border border-border bg-bg px-3 py-2.5 text-xs font-medium text-heading transition-colors hover:border-accent-border"
                      >
                        <Globe2 className="h-3.5 w-3.5 shrink-0 text-accent" />
                        US Edition
                        <ChevronDown className="h-3 w-3 shrink-0 text-text-muted" />
                      </button>
                    </div>
                  </div>

                  {/* Scrollable navigation */}
                  <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
                    <div className="mb-3 flex items-center justify-between px-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-dim">
                        Explore
                      </span>
                      <Newspaper className="h-3.5 w-3.5 text-text-dim" />
                    </div>

                    <nav className="space-y-1">
                      {NAV_LINKS.map((link, index) => (
                        <NavLink
                          key={link.to}
                          to={link.to}
                          end={link.to === '/'}
                          onClick={closeMobileMenu}
                          className={({ isActive }) =>
                            `group flex items-center justify-between gap-3 rounded-xl px-3 py-3 transition-colors ${
                              isActive
                                ? 'bg-accent/10 text-accent'
                                : 'text-text hover:bg-surface'
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <div className="flex min-w-0 items-center gap-3">
                                <span
                                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                                    isActive
                                      ? 'bg-accent'
                                      : 'bg-transparent group-hover:bg-text-dim'
                                  }`}
                                />

                                <div className="min-w-0">
                                  <p
                                    className={`text-sm ${
                                      isActive
                                        ? 'font-semibold'
                                        : 'font-medium'
                                    }`}
                                  >
                                    {link.label}
                                  </p>
                                  <p className="mt-0.5 text-[11px] text-text-dim">
                                    {link.description}
                                  </p>
                                </div>
                              </div>

                              <span className="text-[10px] font-medium text-text-dim">
                                {String(index + 1).padStart(2, '0')}
                              </span>
                            </>
                          )}
                        </NavLink>
                      ))}
                    </nav>

                    {/* Theme selector */}
                    <div className="mt-7 border-t border-border pt-5">
                      <div className="mb-3 flex items-center justify-between px-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-dim">
                          Appearance
                        </span>
                        <span className="text-[10px] text-text-dim">
                          {theme === 'system'
                            ? 'Auto'
                            : theme === 'dark'
                              ? 'Dark mode'
                              : 'Light mode'}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setTheme('light')}
                          aria-pressed={theme === 'light'}
                          className={`flex flex-col items-center gap-2 rounded-xl border px-2 py-3 text-xs transition-colors ${
                            theme === 'light'
                              ? 'border-accent bg-accent/10 text-accent'
                              : 'border-border bg-surface text-text-muted hover:text-heading'
                          }`}
                        >
                          <Sun className="h-4 w-4" />
                          Light
                        </button>

                        <button
                          type="button"
                          onClick={() => setTheme('dark')}
                          aria-pressed={theme === 'dark'}
                          className={`flex flex-col items-center gap-2 rounded-xl border px-2 py-3 text-xs transition-colors ${
                            theme === 'dark'
                              ? 'border-accent bg-accent/10 text-accent'
                              : 'border-border bg-surface text-text-muted hover:text-heading'
                          }`}
                        >
                          <Moon className="h-4 w-4" />
                          Dark
                        </button>

                        <button
                          type="button"
                          onClick={() => setTheme('system')}
                          aria-pressed={theme === 'system'}
                          className={`flex flex-col items-center gap-2 rounded-xl border px-2 py-3 text-xs transition-colors ${
                            theme === 'system'
                              ? 'border-accent bg-accent/10 text-accent'
                              : 'border-border bg-surface text-text-muted hover:text-heading'
                          }`}
                        >
                          <Monitor className="h-4 w-4" />
                          Auto
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Drawer footer */}
                  <div className="shrink-0 border-t border-border bg-surface/70 p-4">
                    {isAuthenticated ? (
                      <Link
                        to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 rounded-xl border border-border bg-bg p-3 transition-colors hover:border-accent-border"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">
                          {user?.name?.[0]?.toUpperCase() ?? '?'}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-heading">
                            {user?.name}
                          </p>
                          <p className="text-xs text-text-muted">
                            View your account
                          </p>
                        </div>

                        <UserRound className="h-4 w-4 text-text-muted" />
                      </Link>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          to="/login"
                          onClick={closeMobileMenu}
                          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-bg px-3 py-3 text-sm font-semibold text-heading transition-colors hover:border-accent-border"
                        >
                          <LogIn className="h-4 w-4" />
                          Login
                        </Link>

                        <Link
                          to="/subscribe"
                          onClick={closeMobileMenu}
                          className="flex items-center justify-center rounded-xl bg-heading px-3 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
                        >
                          Subscribe
                        </Link>
                      </div>
                    )}

                    {isAdvertiserAuthenticated && (
                      <Link
                        to="/advertiser"
                        onClick={closeMobileMenu}
                        className="mt-2 block rounded-xl border border-border px-3 py-2.5 text-center text-xs font-medium text-text-muted transition-colors hover:text-heading"
                      >
                        Advertiser Dashboard
                      </Link>
                    )}

                    <p className="mt-3 text-center text-[10px] tracking-wide text-text-dim">
                      IsItTrueNews · Journalism built on verification
                    </p>
                  </div>
                </Drawer.Content>
              </Drawer.Popup>
            </Drawer.Viewport>
          </Drawer.Portal>
        </Drawer.Root>
      </div>

      {/* Trending topics */}
      <div className="hidden bg-bg md:block">
        <CategoryChipBar />
      </div>
      <LocationModal open={locationOpen} onClose={() => setLocationOpen(false)} reader={reader} />
    </header>
  )
}
