import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Check, Circle } from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'
import { estimateReadTimeMinutes } from '@/features/articles/utils/adaptPublicArticle'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { getErrorMessage } from '@/lib/getErrorMessage'
import {
  MAX_BODY_CHARACTERS,
  MAX_SUMMARY_CHARACTERS,
  MAX_TITLE_CHARACTERS,
  countWords,
  hasBodyContent,
  isBodyTooLarge,
} from '../utils/articleDraft'
import { ArticleCoverField } from './ArticleCoverField'
import { ArticlePreview } from './ArticlePreview'
import { LinkListInput } from './LinkListInput'
import { MediaUploadField } from './MediaUploadField'
import { RichTextEditor } from './RichTextEditor'
import { SubmitConfirmDialog } from './SubmitConfirmDialog'
import { TagsInput } from './TagsInput'

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
  // Asked of the author before the article is sent, since an editor is notified straight away.
  submitConfirmation?: { title: string; description: string }
  // Disables the submit button, with the reason shown beside it.
  submitBlockedReason?: string
  isSaving: boolean
  error?: unknown
  onSubmit: (values: ArticleFormValues, intent: ArticleFormIntent) => void
}

type Tab = 'write' | 'preview'

const DEFAULT_CONFIRMATION = {
  title: 'Submit this article for review?',
  description:
    'An editor will review it before it goes live. You won’t be able to edit it while it is in review, and you’ll be notified of their decision.',
}

const FIELD_CLASS =
  'w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm text-heading placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent-border'

const PANEL_CLASS = 'flex flex-col gap-4 p-4 rounded-2xl border border-border bg-surface'

interface ActionBarProps {
  tab: Tab
  setTab: (tab: Tab) => void
  canSaveDraft: boolean
  canSubmit: boolean
  isSaving: boolean
  isDirty: boolean
  submitLabel: string
  message: string | null
  messageIsError: boolean
  onSaveDraft: () => void
  onAskToSubmit: () => void
}

// Rendered above and below the page, so the actions are in reach wherever the author has scrolled to.
function ActionBar({
  tab,
  setTab,
  canSaveDraft,
  canSubmit,
  isSaving,
  isDirty,
  submitLabel,
  message,
  messageIsError,
  onSaveDraft,
  onAskToSubmit,
}: ActionBarProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-end gap-3">
        {isDirty && <span className="text-xs text-text-muted">Unsaved changes</span>}

        {tab === 'preview' && (
          <button
            type="button"
            onClick={() => setTab('write')}
            className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-heading hover:border-accent-border hover:text-accent transition-colors"
          >
            Back to editing
          </button>
        )}
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={!canSaveDraft || isSaving}
          className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-heading hover:border-accent-border hover:text-accent transition-colors disabled:opacity-50"
        >
          Save as draft
        </button>
        {tab === 'write' ? (
          <button
            type="button"
            onClick={() => setTab('preview')}
            className="px-4 py-2.5 rounded-xl bg-brand-gradient text-on-brand text-sm font-medium transition-colors"
          >
            Preview &amp; submit
          </button>
        ) : (
          <button
            type="button"
            onClick={onAskToSubmit}
            disabled={!canSubmit || isSaving}
            className="px-4 py-2.5 rounded-xl bg-brand-gradient text-on-brand text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving…' : submitLabel}
          </button>
        )}
      </div>
      {message && (
        <p role={messageIsError ? 'alert' : undefined} className={`text-xs text-right ${messageIsError ? 'text-disputed' : 'text-text-muted'}`}>
          {message}
        </p>
      )}
    </div>
  )
}

interface ChecklistItem {
  label: string
  done: boolean
  required: boolean
}

function ReadinessChecklist({ items }: { items: ChecklistItem[] }) {
  return (
    <section aria-label="Readiness" className={PANEL_CLASS}>
      <h2 className="text-sm font-semibold text-heading -mb-1">Ready to submit?</h2>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.label} className="flex items-start gap-2 text-sm" data-done={item.done}>
            {item.done ? (
              <Check className="w-4 h-4 mt-0.5 shrink-0 text-verified" aria-hidden="true" />
            ) : (
              <Circle className="w-4 h-4 mt-0.5 shrink-0 text-text-dim" aria-hidden="true" />
            )}
            <span className={item.done ? 'text-text' : 'text-text-muted'}>
              {item.label}
              <span className="text-xs text-text-dim">
                {' '}
                · {item.done ? 'done' : item.required ? 'required' : 'recommended'}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function ArticleForm({
  initial,
  banner,
  submitLabel,
  submitConfirmation = DEFAULT_CONFIRMATION,
  submitBlockedReason,
  isSaving,
  error,
  onSubmit,
}: ArticleFormProps) {
  const { user } = useAuth()
  const { categories } = useCategories()

  const [tab, setTab] = useState<Tab>('write')
  const [confirming, setConfirming] = useState(false)

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

  const values = useMemo<ArticleFormValues>(
    () => ({
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
    }),
    [title, excerpt, body, category, tags, articleImageUrl, articleVideoUrl, videoThumbnailUrl, socialLinks, sourceLinks],
  )

  // Compared on the author's own picks, so the category falling back to the first one isn't an edit.
  const editsKey = JSON.stringify({ ...values, category: pickedCategory })
  const [savedKey] = useState(editsKey)
  const isDirty = editsKey !== savedKey

  useEffect(() => {
    if (!isDirty) return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [isDirty])

  // The headline grows with what is typed, like it does on the published page.
  const titleRef = useRef<HTMLTextAreaElement>(null)
  useLayoutEffect(() => {
    const field = titleRef.current
    if (!field) return
    field.style.height = 'auto'
    field.style.height = `${field.scrollHeight}px`
  }, [title])

  const author = useMemo(() => ({ id: user?.id ?? 'me', name: user?.name ?? 'You' }), [user?.id, user?.name])

  const hasTitle = Boolean(title.trim())
  const hasBody = hasBodyContent(body)
  const tooLarge = isBodyTooLarge(body)
  const wordCount = countWords(body)

  const checklist: ChecklistItem[] = [
    { label: 'A headline', done: hasTitle, required: true },
    { label: 'The text of your story', done: hasBody, required: true },
    { label: 'A category', done: Boolean(category), required: true },
    { label: 'A summary for the article card', done: Boolean(excerpt.trim()), required: false },
    { label: 'A cover image', done: Boolean(articleImageUrl), required: false },
    { label: 'At least one source', done: sourceLinks.length > 0, required: false },
  ]
  const missingRequired = checklist.filter((item) => item.required && !item.done).map((item) => item.label.toLowerCase())

  const sizeMessage = tooLarge
    ? 'This article is too long to save. Shorten it, and add pictures as uploads rather than pasting them in.'
    : null
  const blockedMessage =
    sizeMessage ??
    (missingRequired.length > 0 ? `Still needed: ${missingRequired.join(', ')}.` : null) ??
    submitBlockedReason ??
    null

  const canSaveDraft = hasTitle && Boolean(category) && !tooLarge
  const canSubmit = missingRequired.length === 0 && !tooLarge && !submitBlockedReason

  const barMessage = error != null ? getErrorMessage(error) : tab === 'preview' ? blockedMessage : sizeMessage
  const messageIsError = error != null || Boolean(sizeMessage)

  const finish = (intent: ArticleFormIntent) => {
    setConfirming(false)
    onSubmit(values, intent)
  }

  const showTab = (next: Tab) => {
    setTab(next)
    window.scrollTo({ top: 0 })
  }

  const handleTabKeys = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault()
      showTab(tab === 'write' ? 'preview' : 'write')
      document.getElementById(tab === 'write' ? 'tab-preview' : 'tab-write')?.focus()
    }
  }

  const bar = () => (
    <ActionBar
      tab={tab}
      setTab={showTab}
      canSaveDraft={canSaveDraft}
      canSubmit={canSubmit}
      isSaving={isSaving}
      isDirty={isDirty}
      submitLabel={submitLabel}
      message={barMessage}
      messageIsError={messageIsError}
      onSaveDraft={() => finish('draft')}
      onAskToSubmit={() => setConfirming(true)}
    />
  )

  return (
    <form className="flex flex-col gap-5 w-full" onSubmit={(event) => event.preventDefault()} noValidate>
      {banner}

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div role="tablist" aria-label="Article view" className="flex gap-1" onKeyDown={handleTabKeys}>
          {(['write', 'preview'] as const).map((id) => (
            <button
              key={id}
              id={`tab-${id}`}
              type="button"
              role="tab"
              aria-selected={tab === id}
              aria-controls={`panel-${id}`}
              tabIndex={tab === id ? 0 : -1}
              onClick={() => showTab(id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === id ? 'bg-accent-bg text-accent' : 'text-text-muted hover:text-heading'
              }`}
            >
              {id === 'write' ? 'Write' : 'Preview'}
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-[16rem]">{bar()}</div>
      </div>

      <div id="panel-write" role="tabpanel" aria-labelledby="tab-write" hidden={tab !== 'write'}>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] items-start">
          <div className="flex flex-col gap-5 min-w-0">
            <div className="flex flex-col gap-1">
              <label htmlFor="title" className="sr-only">
                Title
              </label>
              <textarea
                id="title"
                ref={titleRef}
                value={title}
                rows={1}
                maxLength={MAX_TITLE_CHARACTERS}
                onChange={(event) => setTitle(event.target.value.replace(/\s*\n\s*/g, ' '))}
                onKeyDown={(event) => event.key === 'Enter' && event.preventDefault()}
                placeholder="Give your story a clear, specific headline"
                className="w-full resize-none overflow-hidden bg-transparent text-2xl md:text-3xl font-semibold text-heading leading-snug placeholder:text-text-dim focus:outline-none"
              />
              <div className="flex items-center justify-between gap-2 text-sm text-text-muted">
                <p>
                  <span className="font-medium text-heading">{author.name}</span>
                  <span> · {wordCount.toLocaleString()} words</span>
                  <span> · {estimateReadTimeMinutes(body)} min read</span>
                </p>
                <span className="text-xs text-text-dim" aria-label="Headline length">
                  {title.length}/{MAX_TITLE_CHARACTERS}
                </span>
              </div>
            </div>

            <ArticleCoverField value={articleImageUrl} onChange={setArticleImageUrl} />

            <div className="flex flex-col gap-1.5">
              <RichTextEditor value={body} onChange={setBody} placeholder="Write your story here..." />
              <p className={`text-xs ${tooLarge ? 'text-disputed' : 'text-text-dim'}`}>
                {wordCount.toLocaleString()} words · {Math.round((body.length / MAX_BODY_CHARACTERS) * 100)}% of the
                length limit
              </p>
            </div>

            <section aria-label="Sources" className={PANEL_CLASS}>
              <h2 className="text-sm font-semibold text-heading -mb-1">Sources</h2>
              <LinkListInput
                label="Source links"
                helperText="Records, interviews, or datasets behind this story. Shown to readers under the article."
                placeholder="https://example.com/source"
                links={sourceLinks}
                onChange={setSourceLinks}
              />
            </section>
          </div>

          <aside className="flex flex-col gap-4 min-w-0">
            <ReadinessChecklist items={checklist} />

            <section aria-label="Details" className={PANEL_CLASS}>
              <h2 className="text-sm font-semibold text-heading -mb-1">Details</h2>

              <div>
                <label className="block text-xs text-text-muted mb-1.5" htmlFor="category">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className={FIELD_CLASS}
                >
                  {categories.length === 0 && <option value="">Loading…</option>}
                  {categories.map((option) => (
                    <option key={option.id} value={option.name}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-text-muted mb-1.5" htmlFor="excerpt">
                  Summary
                </label>
                <textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(event) => setExcerpt(event.target.value)}
                  rows={3}
                  maxLength={MAX_SUMMARY_CHARACTERS}
                  placeholder="One or two sentences shown on article cards"
                  className={`${FIELD_CLASS} resize-none`}
                />
                <p className="text-xs text-text-dim mt-1 text-right">
                  {excerpt.length}/{MAX_SUMMARY_CHARACTERS}
                </p>
              </div>

              <TagsInput
                label="Tags"
                helperText="Help readers discover this story on tag pages."
                placeholder="e.g. Breaking News"
                tags={tags}
                onChange={setTags}
              />
            </section>

            <section aria-label="Video" className={PANEL_CLASS}>
              <h2 className="text-sm font-semibold text-heading -mb-1">Video</h2>
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
            </section>

            <section aria-label="Social links" className={PANEL_CLASS}>
              <h2 className="text-sm font-semibold text-heading -mb-1">Social links</h2>
              <LinkListInput
                label="Social links"
                helperText="Related posts or accounts to reference alongside this story."
                placeholder="https://twitter.com/..."
                links={socialLinks}
                onChange={setSocialLinks}
              />
            </section>
          </aside>
        </div>
      </div>

      <div id="panel-preview" role="tabpanel" aria-labelledby="tab-preview" hidden={tab !== 'preview'}>
        {tab === 'preview' && <ArticlePreview values={values} author={author} />}
      </div>

      <div className="border-t border-border pt-4">{bar()}</div>

      {confirming && (
        <SubmitConfirmDialog
          title={submitConfirmation.title}
          description={submitConfirmation.description}
          confirmLabel={submitLabel}
          onConfirm={() => finish('submit')}
          onCancel={() => setConfirming(false)}
        />
      )}
    </form>
  )
}
