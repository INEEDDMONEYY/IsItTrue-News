import { useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Search, Menu, X, MapPin, ChevronDown, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'
import { useTheme } from '@/app/providers/ThemeProvider'
import { useCategories } from '@/features/categories/hooks/useCategories'
import logo from '@/assets/icons/question-icon-removebg.png'

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'For You', to: '/for-you' },
  { label: 'Local', to: '/local' },
  { label: 'Fact Checks', to: '/fact-checks' },
]

export function Header() {
  const { isAuthenticated, user } = useAuth()
  const { theme, setTheme } = useTheme()
  const { categories } = useCategories()
  const [mobileOpen, setMobileOpen] = useState(false)
  const topicsScrollRef = useRef<HTMLDivElement>(null)

  const scrollTopics = (direction: 'left' | 'right') => {
    topicsScrollRef.current?.scrollBy({
      left: direction === 'left' ? -240 : 240,
      behavior: 'smooth',
    })
  }

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
            <img
              src={logo}
              alt="IsItTrue"
              className="h-9 w-auto rounded-md bg-white px-2 py-1 border border-border"
            />
            <span className="hidden sm:block text-lg font-semibold text-heading tracking-tight">
              IsItTrue News
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

          <div className="hidden lg:flex items-center relative w-64">
            <Search className="absolute left-3 w-4 h-4 text-text-dim" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-surface text-sm text-heading placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent-border"
            />
          </div>

          <button
            aria-label="Search"
            className="p-2 rounded-full text-text-muted hover:text-text hover:bg-surface transition-colors lg:hidden"
          >
            <Search className="w-[18px] h-[18px]" />
          </button>

          <button className="hidden sm:inline-flex text-sm font-medium px-4 py-2 rounded-lg bg-heading text-bg hover:opacity-90 transition-opacity">
            Subscribe
          </button>

          {isAuthenticated ? (
            <Link
              to={user?.role === 'admin' ? '/admin' : '/dashboard'}
              className="hidden sm:flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-border hover:border-accent-border transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-accent-bg flex items-center justify-center text-xs font-medium text-accent">
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
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-11 flex items-center gap-2">
          <button
            type="button"
            aria-label="Scroll categories left"
            onClick={() => scrollTopics('left')}
            className="shrink-0 p-1 rounded-full text-text-muted hover:text-text hover:bg-surface transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={topicsScrollRef}
            className="flex items-center gap-2 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="gradient-border-chip shrink-0 flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full text-xs text-text-muted hover:text-text transition-colors whitespace-nowrap"
              >
                {category.name}
                <Plus className="w-3 h-3" />
              </Link>
            ))}
          </div>

          <button
            type="button"
            aria-label="Scroll categories right"
            onClick={() => scrollTopics('right')}
            className="shrink-0 p-1 rounded-full text-text-muted hover:text-text hover:bg-surface transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}