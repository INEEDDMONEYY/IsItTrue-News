import {
  Bookmark,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  FileText,
  FolderSearch,
  Image as ImageIcon,
  ShieldCheck,
  Video,
  X,
} from 'lucide-react'
import type { BookmarkItem } from '../types/bookmark.types'

interface BookmarkCardProps {
  item: BookmarkItem
  onRemove: (id: string) => void
}

const typeConfig = {
  article: {
    label: 'Article',
    icon: FileText,
  },
  investigation: {
    label: 'Investigation',
    icon: FolderSearch,
  },
  'fact-check': {
    label: 'Fact Check',
    icon: ShieldCheck,
  },
  video: {
    label: 'Video',
    icon: Video,
  },
  source: {
    label: 'Source',
    icon: FileCheck2,
  },
  evidence: {
    label: 'Evidence',
    icon: CheckCircle2,
  },
}

export default function BookmarkCard({
  item,
  onRemove,
}: BookmarkCardProps) {
  const config = typeConfig[item.type]
  const TypeIcon = config.icon

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative flex h-40 items-center justify-center bg-[var(--color-card-2)]">
        <ImageIcon className="h-10 w-10 text-[var(--color-card-text-dim)]" />

        <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-[var(--color-card-border)] bg-[var(--color-card)] px-3 py-1.5 text-xs font-semibold text-[var(--color-card-text)]">
          <TypeIcon className="h-3.5 w-3.5 text-[var(--color-accent)]" />
          {config.label}
        </div>

        <button
          type="button"
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${item.title} from bookmarks`}
          className="absolute right-4 top-4 rounded-full border border-[var(--color-card-border)] bg-[var(--color-card)] p-2 text-[var(--color-card-text-muted)] transition-colors hover:text-red-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          {item.category && (
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">
              {item.category}
            </span>
          )}

          <span className="inline-flex items-center gap-1 text-xs text-[var(--color-card-text-dim)]">
            <Bookmark className="h-3.5 w-3.5 fill-current" />
            Saved
          </span>
        </div>

        <h3 className="line-clamp-2 text-lg font-bold leading-snug text-[var(--color-card-heading)]">
          {item.title}
        </h3>

        {item.description && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--color-card-text-muted)]">
            {item.description}
          </p>
        )}

        <div className="mt-auto pt-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-card-text-dim)]">
            {item.author && <span>{item.author}</span>}
            {item.readTime && <span>{item.readTime}</span>}
            {item.status && (
              <span className="font-medium text-[var(--color-verified)]">
                {item.status}
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[var(--color-card-border)] pt-4">
            <span className="text-xs text-[var(--color-card-text-dim)]">
              Saved {new Date(item.savedAt).toLocaleDateString()}
            </span>

            <a
              href={item.href}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)]"
            >
              View
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}