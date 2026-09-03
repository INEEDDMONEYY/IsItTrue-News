// Truncates author-authored rich-text HTML to its first N block-level
// paragraphs, for the anonymous/free-plan article preview. Falls back to
// treating double-newline-separated plain text as paragraphs when there are
// no <p> tags to match (older/plain-text bodies).
export function truncateToParagraphs(html: string, paragraphCount = 2): string {
  const matches = html.match(/<p[^>]*>[\s\S]*?<\/p>/gi)
  if (matches && matches.length > 0) {
    return matches.slice(0, paragraphCount).join('')
  }

  const parts = html.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean)
  return parts
    .slice(0, paragraphCount)
    .map((part) => `<p>${part}</p>`)
    .join('')
}
