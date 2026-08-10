import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthorArticles } from '../hooks/useAuthorArticles'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { MediaUploadField } from '../components/MediaUploadField'
import { LinkListInput } from '../components/LinkListInput'
import { TagsInput } from '../components/TagsInput'
import { RichTextEditor } from '../components/RichTextEditor'

export function NewArticlePage() {
  const navigate = useNavigate()
  const { createArticle } = useAuthorArticles()
  const { categories } = useCategories()

  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    if (!category && categories.length > 0) {
      setCategory(categories[0].name)
    }
  }, [category, categories])

  const [articleImageUrl, setArticleImageUrl] = useState<string | null>(null)
  const [articleVideoUrl, setArticleVideoUrl] = useState<string | null>(null)
  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState<string | null>(null)

  const [tags, setTags] = useState<string[]>([])

  const [socialLinks, setSocialLinks] = useState<string[]>([])
  const [sourceLinks, setSourceLinks] = useState<string[]>([])

  const handleSubmit = async (e: FormEvent, status: 'draft' | 'published') => {
    e.preventDefault()
    await createArticle({
      title,
      excerpt,
      body,
      category,
      status,
      tags: tags.length ? tags : undefined,
      articleImageUrl: articleImageUrl ?? undefined,
      articleVideoUrl: articleVideoUrl ?? undefined,
      videoThumbnailUrl: articleVideoUrl ? (videoThumbnailUrl ?? undefined) : undefined,
      socialLinks: socialLinks.length ? socialLinks : undefined,
      sourceLinks: sourceLinks.length ? sourceLinks : undefined,
    })
    navigate('/dashboard/articles')
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-heading mb-1">New Article</h1>
      <p className="text-sm text-text-muted mb-6">
        Save as a draft to keep working on it, or publish it now to post it right away.
      </p>

      <form className="flex flex-col gap-4 max-w-2xl">
        <div>
          <label className="block text-xs text-text-muted mb-1.5" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Give your story a clear, specific headline"
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm text-heading placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent-border"
          />
        </div>

        <div>
          <label className="block text-xs text-text-muted mb-1.5" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent-border"
          >
            {categories.map((option) => (
              <option key={option.id} value={option.name}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-text-muted mb-1.5" htmlFor="excerpt">
            Excerpt
          </label>
          <textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            placeholder="A one or two sentence summary shown on article cards"
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm text-heading placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent-border resize-none"
          />
        </div>

        <div className="flex flex-col gap-4 p-4 rounded-2xl border border-border bg-surface">
          <h2 className="text-sm font-semibold text-heading -mb-1">Media</h2>
          <div className="flex flex-wrap gap-4">
            <MediaUploadField
              label="Article image"
              helperText="Shown as the main cover image."
              accept="image/*"
              kind="image"
              value={articleImageUrl}
              onChange={setArticleImageUrl}
            />
            <MediaUploadField
              label="Article video"
              helperText="Optional — attach a video for this story."
              accept="video/*"
              kind="video"
              value={articleVideoUrl}
              onChange={setArticleVideoUrl}
            />
            {articleVideoUrl && (
              <MediaUploadField
                label="Video thumbnail"
                helperText="Cover shown before the video plays."
                accept="image/*"
                kind="image"
                value={videoThumbnailUrl}
                onChange={setVideoThumbnailUrl}
              />
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs text-text-muted mb-1.5">Body</label>
          <RichTextEditor value={body} onChange={setBody} placeholder="Write your story here..." />
        </div>

        <TagsInput
          label="Tags"
          helperText="Help readers discover this story on tag pages."
          placeholder="e.g. Breaking News"
          tags={tags}
          onChange={setTags}
        />

        <div className="flex flex-col gap-4 p-4 rounded-2xl border border-border bg-surface">
          <h2 className="text-sm font-semibold text-heading -mb-1">Sourcing &amp; links</h2>
          <LinkListInput
            label="Source links"
            helperText="Records, interviews, or datasets you used to fact-check this story."
            placeholder="https://example.com/source"
            links={sourceLinks}
            onChange={setSourceLinks}
          />
          <LinkListInput
            label="Social links"
            helperText="Related posts or accounts to reference alongside this story."
            placeholder="https://twitter.com/..."
            links={socialLinks}
            onChange={setSocialLinks}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'draft')}
            disabled={!title.trim()}
            className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-heading hover:border-accent-border hover:text-accent transition-colors disabled:opacity-50"
          >
            Save as draft
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'published')}
            disabled={!title.trim() || !body.trim()}
            className="px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            Publish
          </button>
        </div>
      </form>
    </div>
  )
}
