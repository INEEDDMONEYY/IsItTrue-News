
import { useMemo, useState } from 'react'
import { Bookmark, BookOpen, ShieldCheck } from 'lucide-react'
import BookmarkCard from '@/features/bookmarks/components/BookmarkCard'
import BookmarkFilters from '@/features/bookmarks/components/BookmarkFilters'
import { mockBookmarks } from '@/features/bookmarks/data/mockBookmarks'
import type { BookmarkContentType } from '@/features/bookmarks/types/bookmark.types'

export function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState(mockBookmarks)
  const [search, setSearch] = useState('')
  const [type, setType] = useState<BookmarkContentType | 'all'>('all')
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')

  const totalBookmarks = bookmarks.length
  const articleCount = bookmarks.filter(
    (bookmark) => bookmark.type === 'article',
  ).length
  const factCheckCount = bookmarks.filter(
    (bookmark) => bookmark.type === 'fact-check',
  ).length

  const visibleBookmarks = useMemo(() => {
    const filtered = bookmarks.filter((bookmark) => {
      const matchesType = type === 'all' || bookmark.type === type
      const matchesSearch = bookmark.title
        .toLowerCase()
        .includes(search.toLowerCase())
      return matchesType && matchesSearch
    })

    return [...filtered].sort((a, b) => {
      const diff = new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
      return sort === 'newest' ? diff : -diff
    })
  }, [bookmarks, search, type, sort])

  const handleRemove = (id: string) => {
    setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== id))
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-6 md:p-8">
      {/* Header */}
      <section>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
            <Bookmark className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Bookmarks
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-muted)] md:text-base">
              Organize articles and fact checks you've saved to read, review,
              or reference later.
            </p>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
              <Bookmark className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-[var(--color-card-text-muted)]">
                Total Saved
              </p>
              <p className="text-2xl font-bold text-[var(--color-card-heading)]">
                {totalBookmarks}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
              <BookOpen className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-[var(--color-card-text-muted)]">
                Articles
              </p>
              <p className="text-2xl font-bold text-[var(--color-card-heading)]">
                {articleCount}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-[var(--color-card-text-muted)]">
                Fact Checks
              </p>
              <p className="text-2xl font-bold text-[var(--color-card-heading)]">
                {factCheckCount}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section>
        <BookmarkFilters
          search={search}
          type={type}
          sort={sort}
          onSearchChange={setSearch}
          onTypeChange={setType}
          onSortChange={setSort}
        />
      </section>

      {/* Bookmarks */}
      <section>
        {visibleBookmarks.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleBookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                item={bookmark}
                onRemove={handleRemove}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-card)] px-6 py-16 text-center">
            <Bookmark className="mx-auto h-8 w-8 text-[var(--color-text-dim)]" />

            <h2 className="mt-4 text-lg font-semibold text-[var(--color-heading)]">
              No bookmarks yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-text-muted)]">
              Save articles and fact checks while browsing and they'll appear
              here.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

