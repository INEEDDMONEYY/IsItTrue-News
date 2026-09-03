import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Loader2, Search, Tag as TagIcon, User as UserIcon, Video as VideoIcon } from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { useSearch } from '../hooks/useSearch'
import type { SearchResultItem, SearchResultType } from '../types/search.types'

const RESULT_ICONS: Record<SearchResultType, typeof FileText> = {
  article: FileText,
  video: VideoIcon,
  author: UserIcon,
  topic: TagIcon,
}

const RESULT_GROUP_LABELS: Record<SearchResultType, string> = {
  article: 'Articles',
  video: 'Videos',
  author: 'Authors',
  topic: 'Topics',
}

interface SearchBarProps {
  className?: string
  inputClassName?: string
  onNavigate?: () => void
  autoFocus?: boolean
}

/**
 * Site-wide search input + results dropdown. Gating is server-driven:
 * anonymous visitors get unlimited but unfiltered "all types" results,
 * free-plan readers get a capped number of searches per month (surfaced
 * here as a 429 error / remaining-count footer), premium is unlimited.
 */
export function SearchBar({ className = '', inputClassName = '', onNavigate, autoFocus }: SearchBarProps) {
  const { isAuthenticated } = useAuth()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const { results, isLoading, error, debouncedQuery } = useSearch(query)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const closeAndReset = () => {
    setIsOpen(false)
    setQuery('')
    onNavigate?.()
  }

  const groups: { type: SearchResultType; items: SearchResultItem[] }[] = results
    ? (
        [
          { type: 'article', items: results.articles },
          { type: 'video', items: results.videos },
          { type: 'author', items: results.authors },
          { type: 'topic', items: results.topics },
        ] as const
      ).filter((group) => group.items.length > 0)
    : []

  const showDropdown = isOpen && debouncedQuery.length > 1

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-text-dim" />
      <input
        type="text"
        value={query}
        autoFocus={autoFocus}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setIsOpen(true)}
        placeholder="Search"
        aria-label="Search"
        className={`w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-surface text-sm text-heading placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent-border ${inputClassName}`}
      />

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-2 max-h-[70vh] overflow-y-auto rounded-xl border border-border bg-surface shadow-xl z-50 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {isLoading && (
            <div className="flex items-center gap-2 px-4 py-4 text-sm text-text-muted">
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching...
            </div>
          )}

          {!isLoading && error && (
            <div className="px-4 py-4 text-sm text-text-muted">
              <p>{getErrorMessage(error, 'Something went wrong. Please try again.')}</p>
              {isAuthenticated && (
                <Link
                  to="/subscribe"
                  onClick={closeAndReset}
                  className="mt-2 inline-block font-medium text-accent hover:underline"
                >
                  Upgrade to premium for unlimited searches
                </Link>
              )}
            </div>
          )}

          {!isLoading && !error && groups.length === 0 && (
            <div className="px-4 py-4 text-sm text-text-muted">No results for "{debouncedQuery}"</div>
          )}

          {!isLoading &&
            !error &&
            groups.map((group) => {
              const Icon = RESULT_ICONS[group.type]
              return (
                <div key={group.type} className="border-b border-border py-2 last:border-0">
                  <p className="px-4 pb-1 text-xs font-semibold uppercase tracking-wide text-text-dim">
                    {RESULT_GROUP_LABELS[group.type]}
                  </p>
                  {group.items.map((item) => (
                    <Link
                      key={item.id}
                      to={item.href}
                      onClick={closeAndReset}
                      className="flex items-start gap-3 px-4 py-2 transition-colors hover:bg-bg"
                    >
                      <Icon className="mt-0.5 w-4 h-4 shrink-0 text-text-dim" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-heading">{item.title}</span>
                        {item.description && (
                          <span className="block truncate text-xs text-text-muted">{item.description}</span>
                        )}
                      </span>
                    </Link>
                  ))}
                </div>
              )
            })}

          {!isLoading && !error && results && !isAuthenticated && (
            <div className="border-t border-border px-4 py-3 text-xs text-text-muted">
              <Link to="/register" onClick={closeAndReset} className="font-medium text-accent hover:underline">
                Sign up
              </Link>{' '}
              to filter results and unlock unlimited access.
            </div>
          )}

          {!isLoading && !error && results && isAuthenticated && results.usage.limit !== null && (
            <div className="border-t border-border px-4 py-3 text-xs text-text-muted">
              {results.usage.remaining} of {results.usage.limit} searches left this month —{' '}
              <Link to="/subscribe" onClick={closeAndReset} className="font-medium text-accent hover:underline">
                upgrade to premium
              </Link>{' '}
              for unlimited.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
