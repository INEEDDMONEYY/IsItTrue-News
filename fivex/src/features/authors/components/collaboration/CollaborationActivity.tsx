
import { useMemo, useState } from 'react'
import {
  Activity,
  ArrowDown,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Filter,
  MessageCircle,
  MessageSquare,
  Search,
  ShieldCheck,
  UserPlus,
} from 'lucide-react'

import {
  mockCollaborationActivity,
  mockCollaborationAuthors,
  mockCollaborations,
} from '@/features/authors/data/mockCollaborations'
import type { CollaborationActivity as ActivityItem } from '@/features/authors/types/collaboration.types'

type ActivityFilter =
  | 'all'
  | 'document'
  | 'comment'
  | 'member'
  | 'status'
  | 'message'

const activityFilters: {
  value: ActivityFilter
  label: string
}[] = [
  { value: 'all', label: 'All activity' },
  { value: 'document', label: 'Documents' },
  { value: 'comment', label: 'Comments' },
  { value: 'member', label: 'Collaborators' },
  { value: 'status', label: 'Status updates' },
  { value: 'message', label: 'Messages' },
]

const activityStyles = {
  document: {
    icon: FileText,
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    label: 'Document update',
  },
  comment: {
    icon: MessageSquare,
    color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    label: 'Comment',
  },
  member: {
    icon: UserPlus,
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    label: 'Collaborator update',
  },
  status: {
    icon: CheckCircle2,
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    label: 'Status update',
  },
  message: {
    icon: MessageCircle,
    color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    label: 'Message',
  },
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function getAuthorName(authorId: string) {
  return (
    mockCollaborationAuthors.find((author) => author.id === authorId)?.name ??
    'Unknown author'
  )
}

function formatActivityTime(date: string) {
  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) return date

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(parsedDate)
}

function formatDayHeading(date: string) {
  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) return date

  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const isSameDay = (first: Date, second: Date) =>
    first.getDate() === second.getDate() &&
    first.getMonth() === second.getMonth() &&
    first.getFullYear() === second.getFullYear()

  if (isSameDay(parsedDate, today)) return 'Today'
  if (isSameDay(parsedDate, yesterday)) return 'Yesterday'

  return new Intl.DateTimeFormat('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate)
}

function getDayKey(date: string) {
  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) return date

  return [
    parsedDate.getFullYear(),
    parsedDate.getMonth(),
    parsedDate.getDate(),
  ].join('-')
}

function ActivityAvatar({ name }: { name: string }) {
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-xs font-semibold text-[var(--color-heading)]"
      title={name}
    >
      {getInitials(name)}
    </div>
  )
}

function ActivityCard({
  item,
}: {
  item: ActivityItem
}) {
  const config = activityStyles[item.type]
  const Icon = config.icon
  const authorName = getAuthorName(item.author.id)

  return (
    <article className="flex gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition hover:border-[var(--color-accent)]/30 sm:gap-4 sm:p-5">
      <ActivityAvatar name={authorName} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm leading-6 text-[var(--color-heading)]">
              <span className="font-semibold">{authorName}</span>{' '}
              <span className="text-[var(--color-text-muted)]">
                {item.action}
              </span>{' '}
              <span className="font-medium">{item.target}</span>
            </p>
          </div>

          <span className="shrink-0 text-xs text-[var(--color-text-muted)]">
            {formatActivityTime(item.createdAt)}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium ${config.color}`}
          >
            <Icon className="h-3.5 w-3.5" />
            {config.label}
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-surface-muted)] px-2.5 py-1 text-[11px] text-[var(--color-text-muted)]">
            <ArrowUpRight className="h-3 w-3" />
            {item.projectTitle}
          </span>
        </div>
      </div>
    </article>
  )
}

function ActivityGroup({
  date,
  items,
}: {
  date: string
  items: ActivityItem[]
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-3">
        <h3 className="text-sm font-semibold text-[var(--color-heading)]">
          {formatDayHeading(date)}
        </h3>
        <div className="h-px flex-1 bg-[var(--color-border)]" />
        <span className="text-xs text-[var(--color-text-muted)]">
          {items.length} {items.length === 1 ? 'update' : 'updates'}
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <ActivityCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}

export function CollaborationActivity() {
  const [activity] = useState<ActivityItem[]>(
    mockCollaborationActivity,
  )

  const [filter, setFilter] = useState<ActivityFilter>('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filteredActivity = useMemo(() => {
    const query = search.trim().toLowerCase()

    return [...activity]
      .filter((item) => {
        const matchesType =
          filter === 'all' || item.type === filter

        const matchesProject =
          projectFilter === 'all' ||
          mockCollaborations.some(
            (project) =>
              project.title === item.projectTitle &&
              project.id === projectFilter,
          )

        const searchableContent = [
          getAuthorName(item.author.id),
          item.action,
          item.target,
          item.projectTitle,
        ]
          .join(' ')
          .toLowerCase()

        const matchesSearch =
          !query || searchableContent.includes(query)

        return matchesType && matchesProject && matchesSearch
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
      )
  }, [activity, filter, projectFilter, search])

  const groupedActivity = useMemo(() => {
    const groups = new Map<string, ActivityItem[]>()

    filteredActivity.forEach((item) => {
      const key = getDayKey(item.createdAt)
      const existing = groups.get(key) ?? []

      existing.push(item)
      groups.set(key, existing)
    })

    return Array.from(groups.values())
  }, [filteredActivity])

  const documentCount = activity.filter(
    (item) => item.type === 'document',
  ).length

  const commentCount = activity.filter(
    (item) => item.type === 'comment',
  ).length

  const collaboratorCount = activity.filter(
    (item) => item.type === 'member',
  ).length

  function clearFilters() {
    setFilter('all')
    setProjectFilter('all')
    setSearch('')
  }

  return (
    <section className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-[var(--color-accent)]" />
          <h2 className="text-xl font-semibold text-[var(--color-heading)]">
            Collaboration activity
          </h2>
        </div>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
          Follow updates across your shared articles, investigations,
          research, and collaborator discussions.
        </p>
      </div>

      {/* Activity statistics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-xs text-[var(--color-text-muted)]">
            Total updates
          </p>
          <p className="mt-2 text-2xl font-bold text-[var(--color-heading)]">
            {activity.length}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-xs text-[var(--color-text-muted)]">
            Documents
          </p>
          <p className="mt-2 text-2xl font-bold text-[var(--color-heading)]">
            {documentCount}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-xs text-[var(--color-text-muted)]">
            Comments
          </p>
          <p className="mt-2 text-2xl font-bold text-[var(--color-heading)]">
            {commentCount}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-xs text-[var(--color-text-muted)]">
            Collaborator updates
          </p>
          <p className="mt-2 text-2xl font-bold text-[var(--color-heading)]">
            {collaboratorCount}
          </p>
        </div>
      </div>

      {/* Search and filters */}
      <div className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search activity, authors, or projects..."
            className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] pl-10 pr-4 text-sm text-[var(--color-heading)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)]"
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
            <span className="text-xs font-medium text-[var(--color-text-muted)]">
              Activity type
            </span>
          </div>

          <label className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-text-muted)]">
              Project
            </span>
            <select
              value={projectFilter}
              onChange={(event) => setProjectFilter(event.target.value)}
              className="min-h-10 max-w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs text-[var(--color-heading)] outline-none focus:border-[var(--color-accent)]"
            >
              <option value="all">All projects</option>
              {mockCollaborations.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          {activityFilters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`rounded-xl px-3 py-2 text-xs font-medium transition ${
                filter === item.value
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity timeline */}
      {filteredActivity.length > 0 ? (
        <div className="space-y-7">
          {groupedActivity.map((items) => (
            <ActivityGroup
              key={getDayKey(items[0].createdAt)}
              date={items[0].createdAt}
              items={items}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]">
            <Activity className="h-5 w-5" />
          </div>

          <h3 className="mt-4 font-semibold text-[var(--color-heading)]">
            No activity found
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--color-text-muted)]">
            There are no updates matching your current filters. Try changing
            your search or selecting another project.
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)] hover:opacity-75"
          >
            <ArrowDown className="h-4 w-4" />
            Clear filters
          </button>
        </div>
      )}

      {/* Integration note */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]/50 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />

          <p className="text-xs leading-5 text-[var(--color-text-muted)]">
            Activity currently displays mock events. Backend integration can
            provide real-time updates, audit history, event permissions,
            pagination, and activity notifications.
          </p>
        </div>
      </div>
    </section>
  )
}
