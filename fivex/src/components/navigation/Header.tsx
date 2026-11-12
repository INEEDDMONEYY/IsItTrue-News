import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Search, Menu, X, MapPin, ChevronDown } from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'
import { useAdvertiserAuth } from '@/app/providers/AdvertiserAuthProvider'
import { useTheme } from '@/app/providers/ThemeProvider'
import { SearchBar } from '@/features/search/components/SearchBar'
import { CategoryChipBar } from './CategoryChipBar'
import logo from '@/assets/icons/isittrue-icon-dark.jpg'
import animatedLogo from '@/assets/isittrue-profile-animation.svg'

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'For You', to: '/for-you' },
  { label: 'Local', to: '/local' },
  { label: 'Fact Checks', to: '/fact-checks' },
  { label: 'Investigations', to: '/investigations' },
  { label: 'Videos', to: '/videos' },
  { label: 'Newsletters', to: '/newsletter' },
]

export function Header() {
  const { isAuthenticated, user } = useAuth()
  const { isAuthenticated: isAdvertiserAuthenticated } = useAdvertiserAuth()
  const { theme, setTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-bg">
      {/* Utility bar */}
      <div className="hidden md:block border-b border-border bg-surface">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-9 flex items-center justify-between text-xs text-text-dim">
          <div className="flex items-center gap-4">
            <span>Theme:</span>
            <button
              onClick={() => setTheme('light')}
              className={theme === 'light' ? 'text-heading font-medium' : 'hover:text-text'}
            >
              Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={theme === 'dark' ? 'text-heading font-medium' : 'hover:text-text'}
            >
              Dark
            </button>
            <button
              onClick={() => setTheme('system')}
              className={theme === 'system' ? 'text-heading font-medium' : 'hover:text-text'}
            >
              Auto
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <button className="flex items-center gap-1 hover:text-text transition-colors">
              <MapPin className="w-3.5 h-3.5" />
              Set Location
            </button>
            <button className="flex items-center gap-1 hover:text-text transition-colors">
              US Edition
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-16 flex items-center gap-4">
          <button
            aria-label="Toggle menu"
            className="p-2 -ml-2 text-text-muted hover:text-text md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2 shrink-0">
            {/* The animated logo; people who ask their system for reduced motion get the still icon. */}
            <picture>
              <source media="(prefers-reduced-motion: reduce)" srcSet={logo} />
              <img src={animatedLogo} alt="IsItTrue" width={40} height={40} className="size-10 rounded-lg ring-1 ring-border" />
            </picture>
            <span className="hidden sm:block text-lg font-semibold text-heading tracking-tight">
              IsItTrueNews
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 ml-2">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm transition-colors ${
                    isActive
                      ? 'text-heading font-medium'
                      : 'text-text-muted hover:text-text'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex-1" />

          <SearchBar className="hidden lg:block w-64" />

          <button
            type="button"
            aria-label="Search"
            onClick={() => setMobileSearchOpen((v) => !v)}
            className="p-2 rounded-full text-text-muted hover:text-text hover:bg-surface transition-colors lg:hidden"
          >
            {mobileSearchOpen ? <X className="w-[18px] h-[18px]" /> : <Search className="w-[18px] h-[18px]" />}
          </button>

          {isAdvertiserAuthenticated ? (
            <Link
              to="/advertiser"
              className="hidden sm:inline-flex text-sm font-medium px-4 py-2 rounded-lg bg-heading text-bg hover:opacity-90 transition-opacity"
            >
              Advertiser Dashboard
            </Link>
          ) : (
            <Link
              to="/subscribe"
              className="hidden sm:inline-flex text-sm font-medium px-4 py-2 rounded-lg bg-heading text-bg hover:opacity-90 transition-opacity"
            >
              Subscribe
            </Link>
          )}

          {isAuthenticated ? (
            <Link
              to={user?.role === 'admin' ? '/admin' : '/dashboard'}
              className="hidden sm:flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-border hover:border-accent-border transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-white">
                {user?.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <span className="text-sm text-text">{user?.name}</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="hidden sm:inline-flex text-sm font-medium px-4 py-2 rounded-lg border border-border text-heading hover:border-accent-border hover:text-accent transition-colors"
            >
              Login
            </Link>
          )}
        </div>

        {mobileSearchOpen && (
          <div className="lg:hidden border-t border-border px-4 py-3 bg-bg">
            <SearchBar autoFocus onNavigate={() => setMobileSearchOpen(false)} />
          </div>
        )}

        {mobileOpen && (
          <nav className="md:hidden border-t border-border px-4 py-3 flex flex-col gap-3 bg-bg">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="text-sm text-text-muted hover:text-text"
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-accent"
            >
              Login
            </Link>
          </nav>
        )}
      </div>

      {/* Trending topics */}
      <div className="hidden md:block bg-bg">
        <CategoryChipBar />
      </div>
    </header>
  )
}