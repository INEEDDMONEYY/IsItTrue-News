import { Link } from 'react-router-dom'
import type { ArticleTag } from '../types/articleDetail.types'

interface ArticleTagsProps {
  tags: ArticleTag[] | undefined
  // Each tag links to its page of stories. Off in the author's preview, where leaving the page would lose work.
  linked?: boolean
}

const CHIP = 'inline-flex items-center rounded-full border border-border px-3 py-1 text-xs text-text-muted'

// The topic tags an author gave a story, shown under its text. Shared by the public article page and the
// author's preview, so the two always look the same. Renders nothing when there are no tags.
export function ArticleTags({ tags, linked = true }: ArticleTagsProps) {
  if (!tags || tags.length === 0) return null

  return (
    <section aria-label="Tags" className="flex flex-wrap items-center gap-2">
      <ul className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <li key={tag.slug}>
            {linked ? (
              <Link to={`/tag/${tag.slug}`} className={`${CHIP} hover:text-accent hover:border-accent-border transition-colors`}>
                #{tag.name}
              </Link>
            ) : (
              <span className={CHIP}>#{tag.name}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
