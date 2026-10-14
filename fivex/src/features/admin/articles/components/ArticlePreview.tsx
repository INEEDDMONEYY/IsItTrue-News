import { useMemo } from 'react'
import { ArticleHeader } from '@/features/articles/components/ArticleHeader'
import { ArticleCover } from '@/features/articles/components/ArticleCover'
import { ArticleBodyHtml } from '@/features/articles/components/ArticleBody'
import { ArticleSources } from '@/features/articles/components/ArticleSources'
import { sanitizeArticleHtml } from '@/features/articles/utils/articleBody'
import type { VerificationStatus } from '@/shared/types/article.types'
import fallbackImage from '@/assets/images/speak-up.jpg'
import type { AdminArticleDetail, AdminFactCheckStatus } from '../types/adminArticle.types'

const VERDICT: Record<AdminFactCheckStatus, VerificationStatus> = {
  approved: 'verified',
  rejected: 'disputed',
  pending: 'pending',
  none: 'unverified',
}

// The article as a reader would see it, from the same components as the public page. Author HTML is
// sanitized before it is rendered, so an admin opening a bad article can't run anything it smuggled in.
export function ArticlePreview({ article }: { article: AdminArticleDetail }) {
  const bodyHtml = useMemo(() => sanitizeArticleHtml(article.body), [article.body])

  return (
    <section aria-label="Article content" className="rounded-2xl border border-border bg-bg px-4 py-6 md:px-8 md:py-8">
      <article className="flex flex-col gap-6 max-w-3xl mx-auto">
        <ArticleHeader
          category={article.category}
          verdict={VERDICT[article.factCheckStatus]}
          title={article.title}
          authorName={article.author?.name ?? 'Deleted user'}
          publishedAt={article.publishedAt ?? article.createdAt}
          readTimeMinutes={article.readTimeMinutes}
        />

        {article.excerpt && <p className="text-base text-text-muted italic">{article.excerpt}</p>}

        <div className="flex flex-col gap-2">
          <ArticleCover src={article.articleImageUrl ?? fallbackImage} alt={article.title} />
          {!article.articleImageUrl && <p className="text-xs text-text-dim">No cover image. Readers see the site&apos;s placeholder.</p>}
        </div>

        {bodyHtml ? (
          <ArticleBodyHtml html={bodyHtml} />
        ) : (
          <p className="text-sm text-text-muted rounded-xl border border-dashed border-border px-4 py-6 text-center">
            This article has no text yet.
          </p>
        )}

        {article.articleVideoUrl && (
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-heading">Attached video</h2>
            <video
              src={article.articleVideoUrl}
              poster={article.videoThumbnailUrl ?? undefined}
              controls
              preload="none"
              className="w-full rounded-xl bg-card-2"
            />
          </div>
        )}

        {article.sourceLinks.length > 0 && <ArticleSources links={article.sourceLinks} />}
      </article>
    </section>
  )
}
