import dayjs from '@/lib/dayjs'
import { VerdictBadge } from '@/features/fact-checks/components/VerdictBadge'
import type { VerificationStatus } from '@/shared/types/article.types'

interface ArticleHeaderProps {
  category: string
  verdict: VerificationStatus
  title: string
  authorName: string
  publishedAt: string
  readTimeMinutes: number
}

// The top of a published article: category, fact-check verdict, headline and byline. Shared by the public
// article page and the author's preview so the two always look the same.
export function ArticleHeader({ category, verdict, title, authorName, publishedAt, readTimeMinutes }: ArticleHeaderProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] uppercase tracking-wide font-medium text-accent">{category}</span>
        <VerdictBadge verdict={verdict} />
      </div>

      <h1 className="text-2xl md:text-3xl font-semibold text-heading leading-snug">{title}</h1>

      <div className="flex items-center gap-2 text-sm text-text-muted">
        <span className="font-medium text-heading">{authorName}</span>
        <span>·</span>
        <span>{dayjs(publishedAt).format('MMM D, YYYY')}</span>
        <span>·</span>
        <span>{readTimeMinutes} min read</span>
      </div>
    </div>
  )
}
