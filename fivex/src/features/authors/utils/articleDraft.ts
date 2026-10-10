import type { PublicArticle } from '@/features/articles/types/publicArticle.types'
import type { ArticleFormValues } from '../components/ArticleForm'

// Mirrors the server's limit on an article body (backend/modules/articles/validations/article.validation.ts).
export const MAX_BODY_CHARACTERS = 200_000
export const MAX_TITLE_CHARACTERS = 200
export const MAX_SUMMARY_CHARACTERS = 400

// The visible text of the editor's HTML, with a space between blocks so words on separate lines don't join.
export function htmlToText(html: string): string {
  if (!html) return ''
  const spaced = html.replace(/<\/(p|div|h[1-6]|li|blockquote)>|<br\s*\/?>/gi, ' ')
  const doc = new DOMParser().parseFromString(spaced, 'text/html')
  return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim()
}

export function countWords(html: string): number {
  const text = htmlToText(html)
  return text ? text.split(' ').length : 0
}

// An article with only an image still has content; an editor left holding "<p><br></p>" does not.
export function hasBodyContent(html: string): boolean {
  return htmlToText(html).length > 0 || /<img\s/i.test(html)
}

// A body this large can't be saved, which in practice means images were pasted in rather than uploaded.
export function isBodyTooLarge(html: string): boolean {
  return html.length > MAX_BODY_CHARACTERS
}

// Builds the article a reader would get, so the preview can run through the same adapter and components as
// the public page. readTimeMinutes is left unset on purpose: the adapter then estimates it exactly as it
// does for a published article.
export function buildPreviewArticle(values: ArticleFormValues, author: { id: string; name: string }): PublicArticle {
  const now = new Date().toISOString()
  return {
    id: 'preview',
    slug: 'preview',
    title: values.title.trim() || 'Untitled article',
    excerpt: values.excerpt.trim(),
    body: values.body,
    category: values.category,
    tags: values.tags,
    sourceLinks: values.sourceLinks,
    status: 'draft',
    factCheckStatus: 'none',
    articleImageUrl: values.articleImageUrl ?? undefined,
    articleVideoUrl: values.articleVideoUrl ?? undefined,
    videoThumbnailUrl: values.videoThumbnailUrl ?? undefined,
    author,
    views: 0,
    likes: 0,
    dislikes: 0,
    shares: 0,
    bookmarks: 0,
    publishedAt: now,
    createdAt: now,
    locked: false,
  }
}
