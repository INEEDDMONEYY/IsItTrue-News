import { Sparkles } from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'
import { ArticleCard } from '@/features/home/components/ArticleCard'
import { AdSlot } from '@/features/ads/components/AdSlot'
import { useForYouArticles } from '../hooks/useForYouArticles'

export function ForYouPage() {
  const { isAuthenticated } = useAuth()
  const { items, isLoading, isError } = useForYouArticles()

  return (
    <div className="py-6 md:py-10 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-accent-bg flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-heading">For You</h1>
          <p className="text-sm text-text-muted">
            Stories picked based on what you read, like, and save.
          </p>
        </div>
      </div>

      <AdSlot placement="header" page="for_you" />

      {!isAuthenticated && (
        <div className="rounded-2xl border border-accent-border bg-accent-bg px-4 py-3 text-sm text-heading">
          Sign in to personalize this feed based on your saves and likes. Showing trending stories for now.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
        <div className="grid min-w-0 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading && <p className="text-sm text-text-muted sm:col-span-2 xl:col-span-3">Loading stories…</p>}
          {isError && (
            <p className="text-sm text-text-muted sm:col-span-2 xl:col-span-3">
              We couldn't load your feed right now. Please try again later.
            </p>
          )}
          {!isLoading && !isError && items.length === 0 && (
            <p className="text-sm text-text-muted sm:col-span-2 xl:col-span-3">
              No stories yet. Check back soon.
            </p>
          )}
          {items.slice(0, 3).map(({ article, reason }) => (
            <div key={article.id} className="flex flex-col gap-2">
              <span className="text-xs text-text-dim px-1">{reason}</span>
              <ArticleCard article={article} />
            </div>
          ))}
          {items.length > 3 && (
            <div className="sm:col-span-2 xl:col-span-3">
              <AdSlot placement="selected_page" page="for_you" />
            </div>
          )}
          {items.slice(3).map(({ article, reason }) => (
            <div key={article.id} className="flex flex-col gap-2">
              <span className="text-xs text-text-dim px-1">{reason}</span>
              <ArticleCard article={article} />
            </div>
          ))}
        </div>

        <aside className="lg:sticky lg:top-6">
          <AdSlot placement="sidepage" page="for_you" />
          <AdSlot placement="section_ad" page="for_you" />
        </aside>
      </div>
    </div>
  )
}
