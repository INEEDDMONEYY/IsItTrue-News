// Splits author-authored rich-text HTML into its block-level paragraphs, for the anonymous/free-plan article
// preview. Falls back to treating double-newline-separated plain text as paragraphs when there are no <p> tags
// to match (older/plain-text bodies).
function toParagraphs(html: string): string[] {
  const matches = html.match(/<p[^>]*>[\s\S]*?<\/p>/gi)
  if (matches && matches.length > 0) return matches

  return html
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => `<p>${part}</p>`)
}

// Truncates the body to its first N block-level paragraphs.
export function truncateToParagraphs(html: string, paragraphCount = 2): string {
  return toParagraphs(html).slice(0, paragraphCount).join('')
}

const LOWER = 'abcdefghijklmnopqrstuvwxyz'
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const randomFrom = (chars: string) => chars[Math.floor(Math.random() * chars.length)]

// Same shape and length as the original text, but every letter and digit is replaced, so nothing of the real
// words can be recovered. HTML entities are kept whole so they don't turn into stray symbols.
function scramble(text: string): string {
  return text
    .split(/(&#?\w+;)/)
    .map((part) =>
      /^&#?\w+;$/.test(part)
        ? part
        : part.replace(/[A-Za-z0-9]/g, (char) =>
            /[a-z]/.test(char) ? randomFrom(LOWER) : /[A-Z]/.test(char) ? randomFrom(UPPER) : String(Math.floor(Math.random() * 10)),
          ),
    )
    .join('')
}

const decodeBasicEntities = (text: string) =>
  text.replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()

/**
 * Stand-in text for the part of an article a reader may not see yet: the paragraphs after the first
 * `visibleCount`, with their text scrambled. It lets the page show a realistically shaped (and blurred) rest of
 * the article without ever sending the real words. Capped at `maxParagraphs` so the response stays small.
 */
export function scrambledRemainder(html: string, visibleCount = 1, maxParagraphs = 8): string[] {
  return toParagraphs(html)
    .slice(visibleCount, visibleCount + maxParagraphs)
    .map((paragraph) => decodeBasicEntities(paragraph.replace(/<[^>]*>/g, ' ')))
    .filter(Boolean)
    .map(scramble)
}
