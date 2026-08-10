import { Link } from 'react-router-dom'
import { Eye, MessageSquare, Share2 } from 'lucide-react'
import type { Article } from '@/shared/types/article.types'

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`
  return String(n)
}

export function FeaturedArticle({ article }: { article: Article }) {
  return (
    <Link
      to={`/article/${article.slug}`}
      className="gradient-border-surface group relative block rounded-2xl overflow-hidden aspect-[16/10] md:aspect-[16/9]"
    >
      <img
        src={article.thumbnailUrl}
        alt={article.title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/10" />

      <div className="absolute top-4 left-4 flex items-center gap-2">
        <span className="text-[11px] uppercase tracking-wide font-medium px-2.5 py-1 rounded-full bg-tag-1/90 text-black">
          {article.category.name}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
        <h2 className="text-white text-xl md:text-2xl font-semibold leading-snug mb-3 max-w-xl [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]">
          {article.title}
        </h2>
        <div className="flex items-center gap-4 text-xs text-white/90">
          <span className="flex items-center gap-1 [text-shadow:0_1px_4px_rgba(0,0,0,0.5)]">
            <Eye className="w-3.5 h-3.5" /> {formatCount(article.stats.views)}
          </span>
          <span className="flex items-center gap-1 [text-shadow:0_1px_4px_rgba(0,0,0,0.5)]">
            <MessageSquare className="w-3.5 h-3.5" />{' '}
            {formatCount(article.stats.comments)}
          </span>
          <span className="flex items-center gap-1 [text-shadow:0_1px_4px_rgba(0,0,0,0.5)]">
            <Share2 className="w-3.5 h-3.5" /> {formatCount(article.stats.shares)}
          </span>
        </div>
      </div>
    </Link>
  )
}