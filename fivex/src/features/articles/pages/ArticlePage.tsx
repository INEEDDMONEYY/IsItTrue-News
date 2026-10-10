import { useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Lock } from 'lucide-react'
import dayjs from '@/lib/dayjs'
import { useAuth } from '@/app/providers/AuthProvider'
import { PageLoader } from '@/components/loaders/PageLoader'
import { SignUpPromptModal } from '@/components/modals/SignUpPromptModal'
import { EngagementBar } from '../components/EngagementBar'
import { FactCheckPanel } from '../components/FactCheckPanel'
import { CommentSection } from '../components/CommentSection'
import { ArticleHeader } from '../components/ArticleHeader'
import { ArticleCover } from '../components/ArticleCover'
import { ArticleBodyHtml } from '../components/ArticleBody'
import { sanitizeArticleHtml } from '../utils/articleBody'
import { ArticleSources } from '../components/ArticleSources'
import { getArticleDetailBySlug } from '../data/mockArticleDetails'
import { publicArticlesApi } from '../api/publicArticles.api'
import { adaptPublicArticleDetail } from '../utils/adaptPublicArticle'
import { useArticleEngagement } from '../hooks/useArticleEngagement'

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const { isAuthenticated } = useAuth()
  const [signUpPrompt, setSignUpPrompt] = useState(false)
  const mockArticle = slug ? getArticleDetailBySlug(slug) : undefined

  // Mock stories cover a fixed set of slugs — any real, author-published
  // article falls back to a real lookup by slug so it's actually viewable
  // instead of always hitting "Article not found".
  const { data: realArticleData, isLoading: isLoadingReal } = useQuery({
    queryKey: ['articles', 'slug', slug],
    queryFn: () => publicArticlesApi.getBySlug(slug!),
    enabled: !mockArticle && Boolean(slug),
  })

  const realArticle = realArticleData?.article
  const article = mockArticle ?? (realArticle ? adaptPublicArticleDetail(realArticle) : undefined)
  const isLoading = !mockArticle && isLoadingReal
  const isRealArticle = !mockArticle && Boolean(realArticle)

  // Mock articles have no backend counterpart, so their like/dislike/repost
  // reactions stay purely local. Real articles are wired to the actual
  // /api/articles/:id/{like,dislike,share} endpoints via useArticleEngagement,
  // with liked/disliked state coming straight from the server response.
  const [mockReaction, setMockReaction] = useState<'like' | 'dislike' | null>(null)
  const [mockReposted, setMockReposted] = useState(false)
  const [mockBookmarked, setMockBookmarked] = useState(false)
  const { toggleLike, toggleDislike, share, toggleBookmark } = useArticleEngagement(realArticle?.id, slug)

  // Sanitize the author's rich-text HTML before rendering it so the body
  // keeps its original formatting (headings, lists, bold/italic, images,
  // links) without exposing readers to stored XSS from article content.
  const sanitizedBodyHtml = sanitizeArticleHtml(article?.bodyHtml)

  const factCheckRef = useRef<HTMLDivElement>(null)
  const commentsRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Anonymous visitors always see the locked preview (see article.service's
  // resolveArticleLock); signed-in free-plan readers past their monthly cap
  // get the separate "upgrade" card further down instead.
  const isAnonLocked = Boolean(article?.locked) && !isAuthenticated
  const isPlanLocked = Boolean(article?.locked) && isAuthenticated

  const handleReturnToFeed = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  if (isLoading) {
    return <PageLoader label="Loading article..." />
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

      <ArticleHeader
        category={article.category.name}
        verdict={article.factCheck.status}
        title={article.title}
        authorName={article.author.name}
        publishedAt={article.publishedAt}
        readTimeMinutes={article.readTimeMinutes}
      />

      <ArticleCover src={article.thumbnailUrl} alt={article.title} blurred={isAnonLocked} />

      <EngagementBar
        likes={article.likes}
        dislikes={article.dislikes}
        commentsCount={article.comments.length}
        reposts={article.reposts}
        bookmarks={isRealArticle ? (realArticleData?.article.bookmarks ?? article.bookmarks) : article.bookmarks}
        liked={isRealArticle ? realArticleData?.liked : mockReaction === 'like'}
        disliked={isRealArticle ? realArticleData?.disliked : mockReaction === 'dislike'}
        reposted={isRealArticle ? false : mockReposted}
        bookmarked={isRealArticle ? realArticleData?.bookmarked : mockBookmarked}
        onLike={() => {
          if (isRealArticle) {
            toggleLike()
          } else {
            setMockReaction((prev) => (prev === 'like' ? null : 'like'))
          }
        }}
        onDislike={() => {
          if (isRealArticle) {
            toggleDislike()
          } else {
            setMockReaction((prev) => (prev === 'dislike' ? null : 'dislike'))
          }
        }}
        onShare={() => {
          if (isRealArticle) {
            share()
          } else {
            setMockReposted((prev) => !prev)
          }
        }}
        onBookmark={() => {
          if (!isAuthenticated) {
            setSignUpPrompt(true)
          } else if (isRealArticle) {
            toggleBookmark()
          } else {
            setMockBookmarked((prev) => !prev)
          }
        }}
        bookmarkInactive={!isAuthenticated}
        onCommentClick={() => commentsRef.current?.scrollIntoView({ behavior: 'smooth' })}
        onFactCheckClick={() => factCheckRef.current?.scrollIntoView({ behavior: 'smooth' })}
      />

      {article.corrections && article.corrections.length > 0 && (
        <section className="flex flex-col gap-3 rounded-xl border border-pending/30 bg-pending/10 p-4">
          <h2 className="text-sm font-semibold text-heading">Corrections</h2>
          <ol className="flex flex-col gap-2">
            {article.corrections.map((correction) => (
              <li key={correction.number} className="text-sm text-text">
                <span className="font-medium text-heading">Correction {correction.number}</span>
                <span className="text-text-muted"> · {dayjs(correction.publishedAt).format('MMM D, YYYY')}</span>
                <p className="mt-0.5 whitespace-pre-line break-words">{correction.text}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {isPlanLocked ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface-2 px-6 py-10 text-center">
          <p className="text-sm font-semibold text-heading">
            You've reached your free plan's monthly article limit
          </p>
          <p className="max-w-md text-sm text-text-muted">
            Headlines, summaries, and fact-checks stay free — subscribe to keep reading full
            articles for the rest of this month.
          </p>
          <Link
            to="/subscribe"
            className="mt-1 rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-on-brand transition"
          >
            View plans & subscribe
          </Link>
        </div>
      ) : sanitizedBodyHtml ? (
        <div className={isAnonLocked ? 'relative max-h-[420px] overflow-hidden' : undefined}>
          <ArticleBodyHtml html={sanitizedBodyHtml} protectedContent={isAnonLocked} />

          {isAnonLocked && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center justify-end gap-3 bg-gradient-to-t from-bg via-bg/95 to-transparent px-4 pb-6 pt-24 text-center">
              <div className="pointer-events-auto flex flex-col items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-bg text-accent">
                  <Lock className="h-5 w-5" />
                </span>
                <p className="max-w-sm text-sm font-semibold text-heading">
                  Members get full access to investigations, evidence, and videos
                </p>
                <Link
                  to="/register"
                  className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-on-brand transition"
                >
                  Sign up to keep reading
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {article.content.map((paragraph, i) => (
            <p key={i} className="text-[15px] text-text leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      )}

      {!isAnonLocked && article.sourceLinks && article.sourceLinks.length > 0 && (
        <ArticleSources links={article.sourceLinks} />
      )}

      <FactCheckPanel ref={factCheckRef} factCheck={article.factCheck} />

      <CommentSection
        ref={commentsRef}
        comments={article.comments}
        articleId={isRealArticle ? realArticle?.id : undefined}
      />

      {signUpPrompt && (
        <SignUpPromptModal
          title="Sign up to bookmark stories"
          description="Create a free account to save articles and come back to them later."
          onClose={() => setSignUpPrompt(false)}
        />
      )}
    </div>
  )
}
