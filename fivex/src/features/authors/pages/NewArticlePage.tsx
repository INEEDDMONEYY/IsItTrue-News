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
      <p className="text-sm text-text-muted mb-6">
        Save as a draft to keep working on it, or{' '}
        {canPublishDirectly
          ? 'publish it now to post it right away.'
          : 'submit it for review — an editor will approve it before it goes live.'}
      </p>

      <ArticleForm
        submitLabel={canPublishDirectly ? 'Publish' : 'Submit for review'}
        isSaving={createMutation.isPending}
        error={createMutation.error}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
