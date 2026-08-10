import { FilePlus2, ShieldCheck, BookMarked, BarChart3, FileText } from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'
import { useAuthorArticles } from '@/features/authors/hooks/useAuthorArticles'
import { QuickLinkCard } from '@/components/cards'

function AuthorOverview() {
  const { articles } = useAuthorArticles()
  const published = articles.filter((a) => a.status === 'published').length
  const drafts = articles.filter((a) => a.status === 'draft').length

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-card-border bg-card p-4">
          <p className="text-xs text-card-text-dim">Published</p>
          <p className="text-xl font-semibold text-card-heading">{published}</p>
        </div>
        <div className="rounded-2xl border border-card-border bg-card p-4">
          <p className="text-xs text-card-text-dim">Drafts</p>
          <p className="text-xl font-semibold text-card-heading">{drafts}</p>
        </div>
        <div className="rounded-2xl border border-card-border bg-card p-4">
          <p className="text-xs text-card-text-dim">Total Articles</p>
          <p className="text-xl font-semibold text-card-heading">{articles.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <QuickLinkCard to="/dashboard/articles/new" label="Create Article" icon={FilePlus2} />
        <QuickLinkCard to="/dashboard/articles" label="My Articles" icon={FileText} />
        <QuickLinkCard to="/dashboard/fact-checks" label="Submit Fact Check" icon={ShieldCheck} />
        <QuickLinkCard to="/dashboard/analytics" label="Analytics" icon={BarChart3} />
      </div>
    </>
  )
}

function EditorOverview() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <QuickLinkCard to="/dashboard/review" label="Review Queue" icon={ShieldCheck} />
      <QuickLinkCard to="/dashboard/analytics" label="Analytics" icon={FileText} />
    </div>
  )
}

function ReaderOverview() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <QuickLinkCard to="/dashboard/bookmarks" label="Bookmarks" icon={BookMarked} />
      <QuickLinkCard to="/" label="Browse Home Feed" icon={FileText} />
    </div>
  )
}

export function DashboardHomePage() {
  const { user } = useAuth()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-heading mb-1">Welcome back, {user?.name}</h1>
      <p className="text-sm text-text-muted mb-6 capitalize">{user?.role} dashboard</p>

      {user?.role === 'author' && <AuthorOverview />}
      {user?.role === 'editor' && <EditorOverview />}
      {(user?.role === 'reader' || !user?.role) && <ReaderOverview />}
    </div>
  )
}
