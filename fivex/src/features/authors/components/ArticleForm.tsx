import { useState, type ReactNode } from 'react'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { MediaUploadField } from './MediaUploadField'
import { LinkListInput } from './LinkListInput'
import { TagsInput } from './TagsInput'
import { RichTextEditor } from './RichTextEditor'

export interface ArticleFormValues {
  title: string
  excerpt: string
  body: string
  category: string
  tags: string[]
  articleImageUrl: string | null
  articleVideoUrl: string | null
  videoThumbnailUrl: string | null
  socialLinks: string[]
  sourceLinks: string[]
}

export type ArticleFormIntent = 'draft' | 'submit'

interface ArticleFormProps {
  initial?: Partial<ArticleFormValues>
  // Shown above the fields, e.g. the editor's feedback on a returned draft.
  banner?: ReactNode
  submitLabel: string
  // Disables the submit button, with the reason shown beside it.
  submitBlockedReason?: string
  isSaving: boolean
  error?: unknown
  onSubmit: (values: ArticleFormValues, intent: ArticleFormIntent) => void
}

export function ArticleForm({
  initial,
  banner,
  submitLabel,
  submitBlockedReason,
  isSaving,
  error,
  onSubmit,
}: ArticleFormProps) {
  const { categories } = useCategories()

  const [title, setTitle] = useState(initial?.title ?? '')
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? '')
  const [body, setBody] = useState(initial?.body ?? '')
  const [pickedCategory, setCategory] = useState(initial?.category ?? '')
  // Falls back to the first category until the author picks one.
  const category = pickedCategory || categories[0]?.name || ''

  const [articleImageUrl, setArticleImageUrl] = useState<string | null>(initial?.articleImageUrl ?? null)
  const [articleVideoUrl, setArticleVideoUrl] = useState<string | null>(initial?.articleVideoUrl ?? null)
  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState<string | null>(initial?.videoThumbnailUrl ?? null)
  const [tags, setTags] = useState<string[]>(initial?.tags ?? [])
  const [socialLinks, setSocialLinks] = useState<string[]>(initial?.socialLinks ?? [])
  const [sourceLinks, setSourceLinks] = useState<string[]>(initial?.sourceLinks ?? [])

  const submit = (intent: ArticleFormIntent) =>
    onSubmit(
      {
        title,
        excerpt,
        body,
        category,
        tags,
        articleImageUrl,
        articleVideoUrl,
        videoThumbnailUrl: articleVideoUrl ? videoThumbnailUrl : null,
        socialLinks,
        sourceLinks,
      },
      intent,
    )

  return (
    <form className="flex flex-col gap-4 max-w-2xl" onSubmit={(event) => event.preventDefault()}>
      {banner}

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

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => submit('draft')}
          disabled={!title.trim() || isSaving}
          className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-heading hover:border-accent-border hover:text-accent transition-colors disabled:opacity-50"
        >
          Save as draft
        </button>
        <button
          type="button"
          onClick={() => submit('submit')}
          disabled={!title.trim() || !body.trim() || isSaving || Boolean(submitBlockedReason)}
          className="px-4 py-2.5 rounded-xl bg-brand-gradient text-on-brand text-sm font-medium transition-colors disabled:opacity-50"
        >
          {submitLabel}
        </button>
        {submitBlockedReason && <p className="text-xs text-text-muted">{submitBlockedReason}</p>}
      </div>

      {error != null && <p className="text-sm text-disputed">{getErrorMessage(error)}</p>}
    </form>
  )
}
