import { useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ExternalLink, Lock } from 'lucide-react'
import DOMPurify from 'dompurify'
import dayjs from '@/lib/dayjs'
import { useAuth } from '@/app/providers/AuthProvider'
import { PageLoader } from '@/components/loaders/PageLoader'
import { SignUpPromptModal } from '@/components/modals/SignUpPromptModal'
import { VerdictBadge } from '@/features/fact-checks/components/VerdictBadge'
import { EngagementBar } from '../components/EngagementBar'
import { FactCheckPanel } from '../components/FactCheckPanel'
import { CommentSection } from '../components/CommentSection'
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
  const bodyHtml = article?.bodyHtml
  const sanitizedBodyHtml = bodyHtml ? DOMPurify.sanitize(bodyHtml).trim() || null : null

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
          className={`w-full h-full object-cover ${isAnonLocked ? 'blur-md select-none' : ''}`}
        />
      </div>

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
            className="mt-1 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover"
          >
            View plans & subscribe
          </Link>
        </div>
      ) : sanitizedBodyHtml ? (
        <div className={isAnonLocked ? 'relative max-h-[420px] overflow-hidden' : undefined}>
          <div
            className="article-body text-[15px] text-text leading-relaxed space-y-4 [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-heading [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-heading [&_blockquote]:border-l-2 [&_blockquote]:border-accent-border [&_blockquote]:pl-3 [&_blockquote]:text-text-muted [&_a]:text-accent [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold"
            style={isAnonLocked ? { userSelect: 'none' } : undefined}
            onCopy={isAnonLocked ? (event) => event.preventDefault() : undefined}
            onCut={isAnonLocked ? (event) => event.preventDefault() : undefined}
            dangerouslySetInnerHTML={{ __html: sanitizedBodyHtml }}
          />

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
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover"
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
