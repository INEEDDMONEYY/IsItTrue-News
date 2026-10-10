import { useMemo, type MouseEvent } from 'react'
import { ArticleHeader } from '@/features/articles/components/ArticleHeader'
import { ArticleCover } from '@/features/articles/components/ArticleCover'
import { ArticleBodyHtml } from '@/features/articles/components/ArticleBody'
import { sanitizeArticleHtml } from '@/features/articles/utils/articleBody'
import { ArticleSources } from '@/features/articles/components/ArticleSources'
import { FactCheckPanel } from '@/features/articles/components/FactCheckPanel'
import { adaptPublicArticleDetail } from '@/features/articles/utils/adaptPublicArticle'
import { ArticleCard } from '@/features/home/components/ArticleCard'
import { buildPreviewArticle } from '../utils/articleDraft'
import type { ArticleFormValues } from './ArticleForm'

interface ArticlePreviewProps {
  values: ArticleFormValues
  author: { id: string; name: string }
}

// A link inside the preview must not take the author away from unsaved work.
const keepAuthorOnPage = (event: MouseEvent<HTMLElement>) => {
  const link = (event.target as HTMLElement).closest('a')
  if (link && link.getAttribute('target') !== '_blank') event.preventDefault()
}

/**
 * What the article will look like to readers, built from the same components and the same adapter as the
 * public article page, so the two can't drift apart.
 */
export function ArticlePreview({ values, author }: ArticlePreviewProps) {
  const article = useMemo(() => adaptPublicArticleDetail(buildPreviewArticle(values, author)), [values, author])
  const bodyHtml = useMemo(() => sanitizeArticleHtml(article.bodyHtml), [article.bodyHtml])

  const notShownYet = [
    values.articleVideoUrl && 'video',
    values.tags.length > 0 && 'tags',
    values.socialLinks.length > 0 && 'social links',
  ].filter(Boolean) as string[]

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem] items-start">
      <section aria-label="Reader view" className="flex flex-col gap-3">
        <p className="text-xs text-text-muted">
          This is the reader view — how your article will look once it&apos;s published. Nothing is published until
          you submit.
        </p>

        <div
          onClickCapture={keepAuthorOnPage}
          className="rounded-2xl border border-border bg-bg px-4 py-6 md:px-10 md:py-10"
        >
          <article className="flex flex-col gap-6 max-w-3xl mx-auto">
            <ArticleHeader
              category={article.category.name}
              verdict={article.factCheck.status}
              title={article.title}
              authorName={article.author.name}
              publishedAt={article.publishedAt}
              readTimeMinutes={article.readTimeMinutes}
            />

            <ArticleCover src={article.thumbnailUrl} alt={article.title} />

            {bodyHtml ? (
              <ArticleBodyHtml html={bodyHtml} />
            ) : (
              <p className="text-sm text-text-muted rounded-xl border border-dashed border-border px-4 py-6 text-center">
                Nothing written yet. Go back to editing to add the text of your story.
              </p>
            )}

            {article.sourceLinks && article.sourceLinks.length > 0 && <ArticleSources links={article.sourceLinks} />}

            <FactCheckPanel factCheck={article.factCheck} />
          </article>
        </div>
      </section>

      <aside className="flex flex-col gap-4">
        <section aria-label="Feed card" className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-heading">In the feed</h2>
          <p className="text-xs text-text-muted">Readers see this card on the homepage and in category lists.</p>
          <div inert className="max-w-xs">
            <ArticleCard article={article} />
          </div>
        </section>

        {!values.articleImageUrl && (
          <p className="text-xs text-text-muted rounded-xl border border-border bg-surface p-3">
            No cover image yet, so readers would see the site&apos;s placeholder picture. Add one in the Write tab.
          </p>
        )}

        {notShownYet.length > 0 && (
          <p className="text-xs text-text-muted rounded-xl border border-border bg-surface p-3">
            Your {notShownYet.join(', ').replace(/, ([^,]*)$/, ' and $1')} will be saved with the article, but the
            article page doesn&apos;t display {notShownYet.length > 1 ? 'them' : 'it'} yet.
          </p>
        )}
      </aside>
    </div>
  )
}
