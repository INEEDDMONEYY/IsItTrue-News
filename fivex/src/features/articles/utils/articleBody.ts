import DOMPurify from 'dompurify'

// The typography of an article's text. The public article page renders with this, and the author's editor
// uses the same string for what they type, so writing and reading look the same.
export const ARTICLE_BODY_CLASSNAME =
  'article-body text-[15px] text-text leading-relaxed space-y-4 [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-heading [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-heading [&_blockquote]:border-l-2 [&_blockquote]:border-accent-border [&_blockquote]:pl-3 [&_blockquote]:text-text-muted [&_a]:text-accent [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold'

// Author HTML must be sanitized before it is rendered, so formatting survives (headings, lists, links, images)
// without exposing readers to scripts smuggled into an article. Returns null when nothing is left to show.
export function sanitizeArticleHtml(html: string | undefined | null): string | null {
  if (!html) return null
  return DOMPurify.sanitize(html).trim() || null
}
