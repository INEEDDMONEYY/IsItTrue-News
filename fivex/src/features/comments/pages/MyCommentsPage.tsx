
import {
  Search,
  MessageSquareText,
} from 'lucide-react'
import { CommentStats } from '@/features/comments/components/CommentStats'
import { CommentTable } from '@/features/comments/components/CommentTable'
import { CommentViewToggle } from '@/features/comments/components/CommentViewToggle'
import { useMyComments } from '@/features/comments/hooks/useMyComments'

export function MyCommentsPage() {
  const {
    comments,
    stats,
    filters,
    setView,
    setSearch,
  } = useMyComments()

  const pageTitle =
    filters.view === 'my-comments'
      ? 'My Comments'
      : 'Comments on My Posts'

  const pageDescription =
    filters.view === 'my-comments'
      ? 'Track the comments you have left across the platform and monitor how readers are engaging with them.'
      : 'Track comments from other users on your published articles so you can follow conversations and respond when needed.'

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <section>
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <MessageSquareText className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--color-heading)]">
                {pageTitle}
              </h1>

              <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--color-text-muted)]">
                {pageDescription}
              </p>
            </div>
          </div>
        </section>

        <CommentViewToggle
          value={filters.view}
          onChange={setView}
        />

        <CommentStats stats={stats} />

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-heading)]">
                {filters.view === 'my-comments'
                  ? 'Your Comments'
                  : 'Reader Comments'}
              </h2>

              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                {comments.length}{' '}
                {comments.length === 1 ? 'comment' : 'comments'} found
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-dim)]" />

              <input
                type="search"
                value={filters.search ?? ''}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search comments..."
                className="h-10 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] pl-9 pr-3 text-sm text-[var(--color-text)] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <CommentTable
            comments={comments}
            view={filters.view}
          />
        </section>
      </div>
    </main>
  )
}

