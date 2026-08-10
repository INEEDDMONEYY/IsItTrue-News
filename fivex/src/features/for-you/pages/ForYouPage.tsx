import { Sparkles } from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'
import { ArticleCard } from '@/features/home/components/ArticleCard'
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

      {!isAuthenticated && (
        <div className="rounded-2xl border border-accent-border bg-accent-bg px-4 py-3 text-sm text-heading">
          Sign in to personalize this feed based on your reading history and followed topics.
          Showing a sample feed for now.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {RECOMMENDED_ARTICLES.map(({ article, reason }) => (
          <div key={article.id} className="flex flex-col gap-2">
            <span className="text-xs text-text-dim px-1">{reason}</span>
            <ArticleCard article={article} />
          </div>
        ))}
      </div>
    </div>
  )
}
