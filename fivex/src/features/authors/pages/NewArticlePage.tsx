import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { articlesApi } from '../api/articles.api'
import { ArticleForm, type ArticleFormIntent, type ArticleFormValues } from '../components/ArticleForm'
import { useAuth } from '@/app/providers/AuthProvider'

export function NewArticlePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  // Only admins can publish outright; authors go through editorial review.
  const canPublishDirectly = user?.role === 'admin'
  const createMutation = useMutation({ mutationFn: articlesApi.create })

  const handleSubmit = async (values: ArticleFormValues, intent: ArticleFormIntent) => {
    const status = intent === 'draft' ? 'draft' : canPublishDirectly ? 'published' : 'pending_review'
    try {
      await createMutation.mutateAsync({
        title: values.title,
        excerpt: values.excerpt,
        body: values.body,
        category: values.category,
        status,
        tags: values.tags.length ? values.tags : undefined,
        articleImageUrl: values.articleImageUrl ?? undefined,
        articleVideoUrl: values.articleVideoUrl ?? undefined,
        videoThumbnailUrl: values.videoThumbnailUrl ?? undefined,
        socialLinks: values.socialLinks.length ? values.socialLinks : undefined,
        sourceLinks: values.sourceLinks.length ? values.sourceLinks : undefined,
      })
      navigate(intent === 'draft' ? '/dashboard/drafts' : '/dashboard/articles')
    } catch {
      // surfaced through createMutation.error
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-heading mb-1">New Article</h1>
      <p className="text-sm text-text-muted mb-5">
        Write your story, check it in the preview, then{' '}
        {canPublishDirectly ? 'publish it.' : 'submit it for review — an editor approves it before it goes live.'}
      </p>

      <ArticleForm
        submitLabel={canPublishDirectly ? 'Publish' : 'Submit for review'}
        submitConfirmation={
          canPublishDirectly
            ? {
                title: 'Publish this article?',
                description: 'It will go live straight away, without an editor’s review.',
              }
            : undefined
        }
        isSaving={createMutation.isPending}
        error={createMutation.error}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
