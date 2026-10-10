import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PageLoader } from '@/components/loaders/PageLoader'
import { articlesApi } from '../api/articles.api'
import { ArticleForm, type ArticleFormIntent, type ArticleFormValues } from '../components/ArticleForm'
import { ReviewFeedbackPanel } from '../components/ReviewFeedbackPanel'
import { hasReviewFeedback } from '../utils/reviewFeedback'
import { DRAFTS_QUERY_KEY } from '../hooks/useMyDrafts'

export function EditArticlePage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: article, isLoading, isError } = useQuery({
    queryKey: ['authors', 'article', id],
    queryFn: () => articlesApi.getById(id),
    enabled: Boolean(id),
  })

  const saveMutation = useMutation({
    mutationFn: async ({ values, intent }: { values: ArticleFormValues; intent: ArticleFormIntent }) => {
      await articlesApi.update(id, {
        title: values.title,
        excerpt: values.excerpt,
        body: values.body,
        category: values.category,
        tags: values.tags,
        articleImageUrl: values.articleImageUrl,
        articleVideoUrl: values.articleVideoUrl,
        videoThumbnailUrl: values.videoThumbnailUrl,
        socialLinks: values.socialLinks,
        sourceLinks: values.sourceLinks,
      })
      if (intent === 'submit') {
        await articlesApi.updateStatus(id, 'pending_review')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DRAFTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['authors', 'article', id] })
      navigate('/dashboard/drafts')
    },
  })

  if (isLoading) return <PageLoader label="Loading article..." />

  if (isError || !article) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-heading">Article not found</h1>
        <Link to="/dashboard/drafts" className="text-sm text-accent hover:underline">
          Back to My Drafts
        </Link>
      </div>
    )
  }

  if (article.status === 'pending_review') {
    return (
      <div className="flex flex-col gap-2 max-w-2xl">
        <h1 className="text-2xl font-semibold text-heading">In editorial review</h1>
        <p className="text-sm text-text-muted">
          &ldquo;{article.title}&rdquo; is with an editor, so it can&apos;t be edited right now. You&apos;ll be notified
          of their decision.
        </p>
        <Link to="/dashboard/drafts" className="text-sm text-accent hover:underline">
          Back to My Drafts
        </Link>
      </div>
    )
  }

  const requirements = article.reviewRequirements ?? []
  const openRequirements = requirements.filter((requirement) => !requirement.done).length
  const isResubmission = hasReviewFeedback(article)

  return (
    <div>
      <h1 className="text-2xl font-semibold text-heading mb-1">Edit Article</h1>
      <p className="text-sm text-text-muted mb-5">
        {isResubmission
          ? 'Work through the editor’s requirements below, then resubmit for review.'
          : 'Update your draft, check it in the preview, then save it or submit it for review.'}
      </p>

      <ArticleForm
        initial={{
          title: article.title,
          excerpt: article.excerpt,
          body: article.body,
          category: article.category,
          tags: article.tags,
          articleImageUrl: article.articleImageUrl ?? null,
          articleVideoUrl: article.articleVideoUrl ?? null,
          videoThumbnailUrl: article.videoThumbnailUrl ?? null,
          socialLinks: article.socialLinks,
          sourceLinks: article.sourceLinks,
        }}
        banner={
          isResubmission ? (
            <ReviewFeedbackPanel
              review={article}
              onToggleRequirement={async (requirementId, done) => {
                await articlesApi.setRequirementDone(id, requirementId, done)
                await queryClient.invalidateQueries({ queryKey: ['authors', 'article', id] })
              }}
            />
          ) : undefined
        }
        submitLabel={isResubmission ? 'Resubmit for review' : 'Submit for review'}
        submitConfirmation={
          isResubmission
            ? {
                title: 'Resubmit this article for review?',
                description:
                  'It goes back to the editor, who will check your changes against their requirements. You won’t be able to edit it while it is in review.',
              }
            : undefined
        }
        submitBlockedReason={
          openRequirements > 0
            ? `Mark all ${requirements.length} requirements as done before resubmitting.`
            : undefined
        }
        isSaving={saveMutation.isPending}
        error={saveMutation.error}
        onSubmit={(values, intent) => saveMutation.mutate({ values, intent })}
      />
    </div>
  )
}
