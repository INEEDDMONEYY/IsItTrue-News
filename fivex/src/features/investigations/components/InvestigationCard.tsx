import { Link } from 'react-router-dom'
import { Bookmark, Eye, Users } from 'lucide-react'
import dayjs from '@/lib/dayjs'
import type { PublicInvestigationSummary } from '../types/investigation.types'

interface InvestigationCardProps {
  investigation: PublicInvestigationSummary
}

export function InvestigationCard({ investigation }: InvestigationCardProps) {
  const authorName =
    investigation.author?.authorProfile?.professionalName || investigation.author?.name || 'Staff Investigator'

  return (
    <Link
      to={`/investigations/${investigation.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-card-border bg-card transition hover:border-accent-border"
    >
      <div className="aspect-[16/9] overflow-hidden bg-card-2">
        {investigation.coverImage ? (
          <img
            src={investigation.coverImage}
            alt={investigation.title}
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-card-text-dim">
            No cover image
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        {investigation.category && (
          <span className="text-[11px] font-medium uppercase tracking-wide text-accent">
            {investigation.category}
          </span>
        )}

        <h2 className="text-lg font-semibold leading-snug text-card-heading">{investigation.title}</h2>

        {investigation.subheadline && (
          <p className="text-sm text-card-text-muted line-clamp-2">{investigation.subheadline}</p>
        )}

        <p className="mt-1 line-clamp-2 text-sm text-card-text-muted">{investigation.summary}</p>

        <div className="mt-3 flex items-center justify-between text-xs text-card-text-dim">
          <div className="flex items-center gap-2">
            <span className="font-medium text-card-text">{authorName}</span>
            {investigation.publishedAt && <span>· {dayjs(investigation.publishedAt).format('MMM D, YYYY')}</span>}
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {investigation.viewsCount}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {investigation.followersCount}
            </span>
            <span className="flex items-center gap-1">
              <Bookmark className="h-3.5 w-3.5" />
              {investigation.bookmarksCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
