import { Sparkles } from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'
import { ArticleCard } from '@/features/home/components/ArticleCard'
import { AdSlot } from '@/features/ads/components/AdSlot'
import { RECOMMENDED_ARTICLES } from '../data/mockForYou'

export function ForYouPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="py-6 md:py-10 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-accent-bg flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-heading">For You</h1>
          <p className="text-sm text-text-muted">
            Stories picked based on what you read, follow, and save.
          </p>
        </div>
      </div>

      <AdSlot placement="header" page="for_you" />

      {!isAuthenticated && (
        <div className="rounded-2xl border border-accent-border bg-accent-bg px-4 py-3 text-sm text-heading">
          Sign in to personalize this feed based on your reading history and followed topics.
          Showing a sample feed for now.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
        <div className="grid min-w-0 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {RECOMMENDED_ARTICLES.slice(0, 3).map(({ article, reason }) => (
            <div key={article.id} className="flex flex-col gap-2">
              <span className="text-xs text-text-dim px-1">{reason}</span>
              <ArticleCard article={article} />
            </div>
          ))}
          {RECOMMENDED_ARTICLES.length > 3 && (
            <div className="sm:col-span-2 xl:col-span-3">
              <AdSlot placement="selected_page" page="for_you" />
            </div>
          )}
          {RECOMMENDED_ARTICLES.slice(3).map(({ article, reason }) => (
            <div key={article.id} className="flex flex-col gap-2">
              <span className="text-xs text-text-dim px-1">{reason}</span>
              <ArticleCard article={article} />
            </div>
          ))}
        </div>

        <aside className="lg:sticky lg:top-6">
          <AdSlot placement="sidepage" />
        </aside>
      </div>
    </div>
  )
}
