import { useEffect, useId, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import { articleStageLabels, investigationStageLabels, type ArticleEditorialStage } from '../types/calendar.types'
import { claimStatusLabels, CLAIM_STATUSES } from '../types/claim.types'
import { useWorkspaceOverview } from '../hooks/useWorkspaceOverview'
import {
  buildWorkItems,
  countArticlesByStage,
  countClaimsByStatus,
  countInvestigationsByStage,
  selectPriorityTasks,
  selectUpcomingDeadlines,
  summarizeWorkload,
  UPCOMING_WINDOW_DAYS,
  type WorkItem,
  type WorkloadCounts,
  type WorkspaceSnapshot,
} from '../utils/workspaceOverview'

const PRIORITY_LIMIT = 15
const DEADLINE_LIMIT = 8
const ARTICLE_STAGES = Object.keys(articleStageLabels) as ArticleEditorialStage[]

function formatDate(value: string | undefined): string {
  return value ? new Date(value).toLocaleDateString() : 'No date'
}

function formatTime(value: number): string {
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  const headingId = useId()
  return (
    <section aria-labelledby={headingId} className="rounded-lg border bg-card p-4">
      <h2 id={headingId} className="font-medium">
        {title}
      </h2>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      <div className="mt-3">{children}</div>
    </section>
  )
}

export function Notice({ tone, children }: { tone: 'info' | 'error'; children: ReactNode }) {
  const styles = tone === 'error' ? 'border-destructive/40 text-destructive' : 'text-muted-foreground'
  return <p className={`rounded-md border px-3 py-2 text-sm ${styles}`}>{children}</p>
}

export function WorkloadGrid({ counts }: { counts: WorkloadCounts }) {
  const cells: Array<[string, number]> = [
    ['Open articles', counts.openArticles],
    ['Open investigations', counts.openInvestigations],
    ['Open claims', counts.openClaims],
    ['Overdue', counts.overdue],
    ['Escalated claims', counts.escalated],
    ['Returned claims', counts.returned],
  ]
  return (
    <dl className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {cells.map(([label, value]) => (
        <div key={label} className="rounded-md bg-muted/40 p-3">
          <dt className="text-xs text-muted-foreground">{label}</dt>
          <dd className="text-xl font-semibold">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function ItemBadges({ item }: { item: WorkItem }) {
  const badges = [
    item.overdue && { label: 'Overdue', className: 'bg-destructive/15 text-destructive' },
    item.escalated && { label: 'Escalated', className: 'bg-amber-500/15 text-amber-700' },
    item.returned && { label: 'Returned', className: 'bg-amber-500/15 text-amber-700' },
    item.mine ? { label: 'Mine', className: 'bg-primary/10 text-primary' } : { label: 'Team', className: 'bg-muted text-muted-foreground' },
  ].filter(Boolean) as Array<{ label: string; className: string }>
  return (
    <span className="flex flex-wrap gap-1">
      {badges.map((badge) => (
        <span key={badge.label} className={`rounded px-2 py-0.5 text-xs ${badge.className}`}>
          {badge.label}
        </span>
      ))}
    </span>
  )
}

const KIND_LABELS: Record<WorkItem['kind'], string> = {
  article: 'Article',
  investigation: 'Investigation',
  claim: 'Claim',
}

export function ItemRow({ item }: { item: WorkItem }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 py-2">
      <span className="min-w-0">
        <span className="block text-xs text-muted-foreground">
          {KIND_LABELS[item.kind]}
          {item.deadline ? ` · due ${formatDate(item.deadline)}` : ''}
        </span>
        <Link to={item.to} className="block truncate font-medium hover:underline">
          {item.title}
        </Link>
      </span>
      <ItemBadges item={item} />
    </li>
  )
}

export function WorkspaceOverview() {
  const { user } = useAuth()
  const data = useWorkspaceOverview()
  const { sources } = data
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(timer)
  }, [])

  const snapshot = useMemo<WorkspaceSnapshot | null>(() => {
    if (
      !user ||
      !data.articles ||
      !data.investigations ||
      !data.myInvestigationIds ||
      !data.claims ||
      !data.factCheckArticles
    ) {
      return null
    }
    return {
      userId: user.id,
      now,
      articles: data.articles,
      investigations: data.investigations,
      myInvestigationIds: data.myInvestigationIds,
      claims: data.claims,
      factCheckArticles: data.factCheckArticles,
    }
  }, [user, now, data.articles, data.investigations, data.myInvestigationIds, data.claims, data.factCheckArticles])

  const items = useMemo(() => (snapshot ? buildWorkItems(snapshot) : null), [snapshot])

  const failedSources = Object.entries(sources)
    .filter(([, query]) => query.isError)
    .map(([name]) => name)
  const lastLoaded = Math.min(
    ...Object.values(sources)
      .map((query) => query.dataUpdatedAt)
      .filter((time) => time > 0),
  )
  const hasAnyData = Number.isFinite(lastLoaded)

  const workItemsFailed = ['articles', 'investigations', 'myInvestigations', 'claims'].some(
    (name) => sources[name as keyof typeof sources].isError && !sources[name as keyof typeof sources].data,
  )
  const factCheckFailed = ['claims', 'factCheckArticles'].some(
    (name) => sources[name as keyof typeof sources].isError && !sources[name as keyof typeof sources].data,
  )
  const isLoading = !snapshot && !workItemsFailed

  if (isLoading) {
    return <Notice tone="info">Loading workspace overview…</Notice>
  }

  const teamWorkload = items ? summarizeWorkload(items) : null
  const mineItems = items?.filter((item) => item.mine) ?? []
  const priorityTasks = items ? selectPriorityTasks(items) : []
  const upcomingDeadlines = items ? selectUpcomingDeadlines(items, now) : []
  const articleStageCounts = data.articles ? countArticlesByStage(data.articles) : null
  const claimStatusCounts = data.claims ? countClaimsByStatus(data.claims) : null
  const investigationStageCounts = data.investigations ? countInvestigationsByStage(data.investigations) : null
  const pendingFactCheckApprovals = data.factCheckArticles?.filter(
    (article) => article.factCheckStatus === 'pending',
  ).length

  return (
    <div className="space-y-6">
      {failedSources.length > 0 && (
        <Notice tone="error">
          Some workspace data could not be refreshed ({failedSources.join(', ')}).
          {hasAnyData && ` Showing data last loaded at ${formatTime(lastLoaded)}.`}
        </Notice>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Workload summary" description="Your responsibilities compared with the whole newsroom.">
          {teamWorkload ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-medium">Mine</h3>
                <WorkloadGrid counts={summarizeWorkload(mineItems)} />
              </div>
              <div>
                <h3 className="mb-2 text-sm font-medium">Team</h3>
                <WorkloadGrid counts={teamWorkload} />
              </div>
            </div>
          ) : (
            <Notice tone="error">Workload is unavailable because a required source failed to load.</Notice>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            Mine: articles you authored, investigations you author or collaborate on, and claims assigned to you.
          </p>
        </Section>

        <Section title="My priority tasks" description="Overdue, escalated and returned work comes first.">
          {items ? (
            priorityTasks.length === 0 ? (
              <Notice tone="info">
                Nothing is overdue, escalated or returned, and you have no open assigned work.
              </Notice>
            ) : (
              <>
                <ul className="divide-y">
                  {priorityTasks.slice(0, PRIORITY_LIMIT).map((item) => (
                    <ItemRow key={item.key} item={item} />
                  ))}
                </ul>
                {priorityTasks.length > PRIORITY_LIMIT && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Showing {PRIORITY_LIMIT} of {priorityTasks.length} tasks.
                  </p>
                )}
              </>
            )
          ) : (
            <Notice tone="error">Tasks are unavailable because a required source failed to load.</Notice>
          )}
        </Section>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Editorial pipeline" description="Current article stages, newsroom-wide. Change stages in the Editorial Calendar.">
          {data.articles && articleStageCounts ? (
            <ul className="space-y-2">
              {ARTICLE_STAGES.map((stage) => {
                const count = articleStageCounts[stage]
                const total = data.articles?.length ?? 0
                return (
                  <li key={stage} className="flex items-center gap-3 text-sm">
                    <span className="w-32 shrink-0">{articleStageLabels[stage]}</span>
                    <span className="h-2 flex-1 rounded bg-muted">
                      <span
                        className="block h-2 rounded bg-primary"
                        style={{ width: total ? `${(count / total) * 100}%` : '0%' }}
                      />
                    </span>
                    <span className="w-8 text-right tabular-nums">{count}</span>
                  </li>
                )
              })}
            </ul>
          ) : (
            <Notice tone="error">The article pipeline is unavailable.</Notice>
          )}
        </Section>

        <Section title="Calendar and deadlines" description={`Open items due in the next ${UPCOMING_WINDOW_DAYS} days, including overdue.`}>
          {items ? (
            upcomingDeadlines.length === 0 ? (
              <Notice tone="info">No open deadlines in the next {UPCOMING_WINDOW_DAYS} days.</Notice>
            ) : (
              <ul className="divide-y">
                {upcomingDeadlines.slice(0, DEADLINE_LIMIT).map((item) => (
                  <ItemRow key={item.key} item={item} />
                ))}
              </ul>
            )
          ) : (
            <Notice tone="error">Deadlines are unavailable because a required source failed to load.</Notice>
          )}
          <Link to="/dashboard/calendar" className="mt-3 inline-block text-sm text-primary hover:underline">
            Open Editorial Calendar
          </Link>
        </Section>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Fact-checking" description="Claim status across the newsroom.">
          {claimStatusCounts && pendingFactCheckApprovals !== undefined ? (
            <>
              <ul className="grid grid-cols-2 gap-2 text-sm">
                {CLAIM_STATUSES.map((status) => (
                  <li key={status} className="flex justify-between rounded bg-muted/40 px-2 py-1">
                    <span>{claimStatusLabels[status]}</span>
                    <span className="tabular-nums">{claimStatusCounts[status]}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-sm">
                Articles awaiting fact-check approval: <span className="font-medium">{pendingFactCheckApprovals}</span>
              </p>
              <Link to="/dashboard/fact-check-oversight" className="mt-2 inline-block text-sm text-primary hover:underline">
                Open Fact Check Oversight
              </Link>
            </>
          ) : factCheckFailed ? (
            <Notice tone="error">Fact-check snapshot is unavailable because a required source failed to load.</Notice>
          ) : (
            <Notice tone="info">Loading fact-check snapshot…</Notice>
          )}
        </Section>

        <Section title="Investigations" description="Open investigations by workflow stage.">
          {investigationStageCounts ? (
            <>
              <ul className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(investigationStageCounts).map(([stage, count]) => (
                  <li key={stage} className="flex justify-between rounded bg-muted/40 px-2 py-1">
                    <span>{investigationStageLabels[stage as keyof typeof investigationStageLabels]}</span>
                    <span className="tabular-nums">{count}</span>
                  </li>
                ))}
              </ul>
              <Link to="/dashboard/investigation-oversight" className="mt-3 inline-block text-sm text-primary hover:underline">
                Open Investigation Oversight
              </Link>
            </>
          ) : (
            <Notice tone="error">The investigation snapshot is unavailable.</Notice>
          )}
        </Section>
      </div>

      <Section title="Source verification" description="Verification workload for sources.">
        <Notice tone="info">
          Source verification is not connected yet. The backend has no source model or source API, so no workload is shown.
        </Notice>
      </Section>

      <Section title="Activity and alerts" description="Accountability and exceptions.">
        <Notice tone="info">
          No editor activity feed is available. The audit log is admin-only and is not shown here.
        </Notice>
        {teamWorkload && (
          <ul className="mt-3 space-y-1 text-sm">
            <li>
              Overdue items: <span className="font-medium">{teamWorkload.overdue}</span>
            </li>
            <li>
              Escalated claims: <span className="font-medium">{teamWorkload.escalated}</span>
            </li>
            <li>
              Returned claims: <span className="font-medium">{teamWorkload.returned}</span>
            </li>
          </ul>
        )}
      </Section>
    </div>
  )
}
