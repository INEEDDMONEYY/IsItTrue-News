import { Link } from 'react-router-dom'
import dayjs from '@/lib/dayjs'
import { VerdictBadge } from '@/features/fact-checks/components/VerdictBadge'
import type { PublicVerdict } from '@/features/fact-checks/types/publicFactCheck.types'

interface ArticleHeaderProps {
  category: string
  // Left out while the story's fact-check is still loading, so a wrong badge isn't shown for a moment.
  verdict?: PublicVerdict
  title: string
  authorName: string
  // The author's profile. Left out for stories with no real author behind them, which then show a plain name.
  authorId?: string
  publishedAt: string
  readTimeMinutes: number
}

// The top of a published article: category, fact-check verdict, headline and byline. Shared by the public
// article page and the author's preview so the two always look the same.
export function ArticleHeader({
  category,
  verdict,
  title,
  authorName,
  authorId,
  publishedAt,
  readTimeMinutes,
}: ArticleHeaderProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] uppercase tracking-wide font-medium text-accent">{category}</span>
        {verdict && <VerdictBadge verdict={verdict} />}
      </div>

      <h1 className="text-2xl md:text-3xl font-semibold text-heading leading-snug">{title}</h1>

      <div className="flex items-center gap-2 text-sm text-text-muted">
        {authorId ? (
          <Link
            to={`/authors/${authorId}`}
            className="font-medium text-heading underline underline-offset-2 hover:text-accent transition-colors"
          >
            {authorName}
          </Link>
        ) : (
          <span className="font-medium text-heading">{authorName}</span>
        )}
        <span>·</span>
        <span>{dayjs(publishedAt).format('MMM D, YYYY')}</span>
        <span>·</span>
        <span>{readTimeMinutes} min read</span>
      </div>
    </div>
  )
}
