import { useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import DOMPurify from 'dompurify'
import dayjs from '@/lib/dayjs'
import { VerdictBadge } from '@/features/fact-checks/components/VerdictBadge'
import { EngagementBar } from '../components/EngagementBar'
import { FactCheckPanel } from '../components/FactCheckPanel'
import { CommentSection } from '../components/CommentSection'
import { getArticleDetailBySlug } from '../data/mockArticleDetails'
import { publicArticlesApi } from '../api/publicArticles.api'
import { adaptPublicArticleDetail } from '../utils/adaptPublicArticle'

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const mockArticle = slug ? getArticleDetailBySlug(slug) : undefined

  // Mock stories cover a fixed set of slugs — any real, author-published
  // article falls back to a real lookup by slug so it's actually viewable
  // instead of always hitting "Article not found".
  const { data: realArticle, isLoading: isLoadingReal } = useQuery({
    queryKey: ['articles', 'slug', slug],
    queryFn: () => publicArticlesApi.getBySlug(slug!),
    enabled: !mockArticle && Boolean(slug),
  })

  const article = mockArticle ?? (realArticle ? adaptPublicArticleDetail(realArticle) : undefined)
  const isLoading = !mockArticle && isLoadingReal

  // Sanitize the author's rich-text HTML before rendering it so the body
  // keeps its original formatting (headings, lists, bold/italic, images,
  // links) without exposing readers to stored XSS from article content.
  const bodyHtml = article?.bodyHtml
  const sanitizedBodyHtml = bodyHtml ? DOMPurify.sanitize(bodyHtml).trim() || null : null

  const factCheckRef = useRef<HTMLDivElement>(null)
  const commentsRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const handleReturnToFeed = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  if (isLoading) {
    return (
      <div className="py-16 flex flex-col items-center text-center gap-3">
        <p className="text-sm text-text-muted">Loading article...</p>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="py-16 flex flex-col items-center text-center gap-3">
        <h1 className="text-2xl font-semibold text-heading">Article not found</h1>
        <p className="text-sm text-text-muted">
          This story may have been moved or no longer exists.
        </p>
        <Link to="/" className="text-accent font-medium hover:underline text-sm">
          Back to Home
        </Link>
      </div>
    )
  }

  return (
    <div className="py-6 md:py-10 flex flex-col gap-6 max-w-3xl mx-auto">
      <button
        type="button"
        onClick={handleReturnToFeed}
        className="self-start flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Feed
      </button>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] uppercase tracking-wide font-medium text-accent">
            {article.category.name}
          </span>
          <VerdictBadge verdict={article.factCheck.status} />
        </div>

        <h1 className="text-2xl md:text-3xl font-semibold text-heading leading-snug">
          {article.title}
        </h1>

        <div className="flex items-center gap-2 text-sm text-text-muted">
          <span className="font-medium text-heading">{article.author.name}</span>
          <span>·</span>
          <span>{dayjs(article.publishedAt).format('MMM D, YYYY')}</span>
          <span>·</span>
          <span>{article.readTimeMinutes} min read</span>
        </div>
      </div>

      <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-card-2">
        <img
          src={article.thumbnailUrl}
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>

      <EngagementBar
        likes={article.likes}
        dislikes={article.dislikes}
        commentsCount={article.comments.length}
        reposts={article.reposts}
        onCommentClick={() => commentsRef.current?.scrollIntoView({ behavior: 'smooth' })}
        onFactCheckClick={() => factCheckRef.current?.scrollIntoView({ behavior: 'smooth' })}
      />

      {sanitizedBodyHtml ? (
        <div
          className="article-body text-[15px] text-text leading-relaxed space-y-4 [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-heading [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-heading [&_blockquote]:border-l-2 [&_blockquote]:border-accent-border [&_blockquote]:pl-3 [&_blockquote]:text-text-muted [&_a]:text-accent [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold"
          dangerouslySetInnerHTML={{ __html: sanitizedBodyHtml }}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {article.content.map((paragraph, i) => (
            <p key={i} className="text-[15px] text-text leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      )}

      {article.sourceLinks && article.sourceLinks.length > 0 && (
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold text-heading">Sources</h2>
          <ul className="flex flex-col gap-1.5">
            {article.sourceLinks.map((link, i) => (
              <li key={i}>
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline break-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <FactCheckPanel ref={factCheckRef} factCheck={article.factCheck} />

      <CommentSection ref={commentsRef} comments={article.comments} />
    </div>
  )
}
