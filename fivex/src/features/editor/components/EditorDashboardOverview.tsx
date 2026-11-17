import { Link } from 'react-router-dom'
import { articleStageLabels, type ArticleEditorialStage } from '../types/calendar.types'
import { claimStatusLabels, isOpenClaim } from '../types/claim.types'
import { useEditorDashboardOverview } from '../hooks/useEditorDashboardOverview'
import { ItemRow, Notice, Section, WorkloadGrid } from './WorkspaceOverview'
import {
  countArticlesByStage,
  countClaimsByStatus,
  isArticleOpen,
  isInvestigationOpen,
  selectPriorityTasks,
  selectUpcomingDeadlines,
  summarizeAssignments,
  summarizeWorkload,
  UPCOMING_WINDOW_DAYS,
} from '../utils/workspaceOverview'

const ATTENTION_LIMIT = 10
const PIPELINE_STAGES: ArticleEditorialStage[] = ['reviewing', 'fact_checking', 'scheduled', 'published']

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-muted/40 p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-xl font-semibold">{value}</dd>
    </div>
  )
}

export function EditorDashboardOverview() {
  const { workspace, sources, items, now, editors, assign } = useEditorDashboardOverview()
  const failedSources = Object.entries(sources)
    .filter(([, query]) => query.isError)
    .map(([name]) => name)

  const { articles, investigations, claims, factCheckArticles } = workspace
  if (!items || !articles || !investigations || !claims || !factCheckArticles) {
    return failedSources.length > 0 ? (
      <Notice tone="error">Editor overview data could not be loaded ({failedSources.join(', ')}). Refresh to try again.</Notice>
    ) : (
      <Notice tone="info">Loading editor overview…</Notice>
    )
  }

  const openArticles = articles.filter(isArticleOpen)
  const stageCounts = countArticlesByStage(articles)
  const articleItems = items.filter((item) => item.kind === 'article')
  const articleOverdue = articleItems.filter((item) => item.overdue).length
  const approvals = openArticles.filter((article) => article.status === 'pending_review').length

  const team = summarizeWorkload(items)
  const mine = summarizeWorkload(items.filter((item) => item.mine))
  const priority = selectPriorityTasks(items).slice(0, ATTENTION_LIMIT)

  const scheduledKeys = new Set(
    openArticles.filter((article) => article.editorialStage === 'scheduled').map((article) => `article:${article.id}`),
  )
  const upcoming = selectUpcomingDeadlines(
    items.filter((item) => scheduledKeys.has(item.key)),
    now,
  )

  const claimCounts = countClaimsByStatus(claims)
  const openClaims = claims.filter((claim) => isOpenClaim(claim.status)).length
  const escalatedClaims = claims.filter((claim) => claim.workflowStatus === 'escalated').length
  const pendingFactCheckArticles = factCheckArticles.filter((article) => article.factCheckStatus === 'pending').length

  const openInvestigations = investigations.filter(isInvestigationOpen)
  const investigationsAwaitingReview = openInvestigations.filter(
    (investigation) => investigation.workflowStage === 'editorial_review',
  ).length
  const investigationOverdue = items.filter((item) => item.kind === 'investigation' && item.overdue).length

  const assignments = summarizeAssignments(articles, editors.data ?? [])
  const itemByKey = new Map(items.map((item) => [item.key, item]))

  return (
    <div className="space-y-6">
      {failedSources.length > 0 && (
        <Notice tone="error">
          Some data could not be refreshed ({failedSources.join(', ')}). Figures may be stale.
        </Notice>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Editorial overview" description="Articles in workflow, approvals, flags and overdue work.">
          <dl className="grid grid-cols-2 gap-3">
            <Stat label="Articles in workflow" value={openArticles.length} />
            <Stat label="Pending approvals" value={approvals} />
            <Stat label="Flags (escalated or returned claims)" value={team.escalated + team.returned} />
            <Stat label="Overdue articles" value={articleOverdue} />
          </dl>
        </Section>

        <Section title="Attention required" description="Overdue, escalated and returned work first.">
          {priority.length === 0 ? (
            <Notice tone="info">Nothing needs editor intervention right now.</Notice>
          ) : (
            <ul className="divide-y">
              {priority.map((item) => (
                <ItemRow key={item.key} item={item} />
              ))}
            </ul>
          )}
        </Section>

        <Section title="Editorial pipeline" description="Current article stages across the newsroom.">
          <dl className="grid grid-cols-2 gap-3">
            {PIPELINE_STAGES.map((stage) => (
              <Stat key={stage} label={articleStageLabels[stage]} value={stageCounts[stage]} />
            ))}
          </dl>
          <p className="mt-3 text-sm">
            <Link to="/dashboard/review" className="underline">
              Open review queue
            </Link>
          </p>
        </Section>

        <Section title="Newsroom activity" description="Recent actions from editors and authors.">
          <Notice tone="info">
            Newsroom activity is unavailable: the application does not provide an editor or author activity feed yet.
          </Notice>
        </Section>

        <Section
          title="Upcoming publications"
          description={`Scheduled articles due within the next ${UPCOMING_WINDOW_DAYS} days, including overdue ones.`}
        >
          {upcoming.length === 0 ? (
            <Notice tone="info">No scheduled articles are due in this window.</Notice>
          ) : (
            <ul className="divide-y">
              {upcoming.map((item) => (
                <ItemRow key={item.key} item={item} />
              ))}
            </ul>
          )}
        </Section>

        <Section title="Fact-check overview" description="Claims pending, completed, disputed and escalated.">
          <dl className="grid grid-cols-2 gap-3">
            <Stat label="Pending claims" value={openClaims} />
            <Stat label="Completed claims" value={claims.length - openClaims} />
            <Stat label={claimStatusLabels.disputed} value={claimCounts.disputed} />
            <Stat label="Escalated claims" value={escalatedClaims} />
            <Stat label="Articles awaiting fact-check approval" value={pendingFactCheckArticles} />
          </dl>
          <p className="mt-3 text-sm">
            <Link to="/dashboard/fact-check-oversight" className="underline">
              Open fact-check oversight
            </Link>
          </p>
        </Section>

        <Section title="Investigation overview" description="Active cases and those awaiting editorial review.">
          <dl className="grid grid-cols-2 gap-3">
            <Stat label="Active investigations" value={openInvestigations.length} />
            <Stat label="Awaiting editorial review" value={investigationsAwaitingReview} />
            <Stat label="Overdue investigations" value={investigationOverdue} />
          </dl>
          <p className="mt-3 text-sm text-muted-foreground">
            Blockers are not shown: the application does not record investigation blockers yet.
          </p>
        </Section>

        <Section title="Source verification" description="Verification backlog and outstanding decisions.">
          <Notice tone="info">Source verification is unavailable: there is no source verification data to display yet.</Notice>
        </Section>

        <Section title="Team overview" description="Your workload, the team's workload and article assignments.">
          <div className="grid gap-4">
            <div>
              <h3 className="mb-2 text-sm font-medium">Mine</h3>
              <WorkloadGrid counts={mine} />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium">Team</h3>
              <WorkloadGrid counts={team} />
            </div>
            {editors.isError ? (
              <Notice tone="error">Editor list could not be loaded, so articles cannot be assigned right now.</Notice>
            ) : (
              <div>
                <h3 className="mb-2 text-sm font-medium">Open articles per editor</h3>
                <ul className="space-y-1 text-sm">
                  {assignments.byEditor.map((editor) => (
                    <li key={editor.id} className="flex justify-between">
                      <span>{editor.name}</span>
                      <span className="font-medium">{editor.openArticles}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <h3 className="mb-2 text-sm font-medium">Unassigned open articles</h3>
              {assign.isError && (
                <Notice tone="error">The assignment could not be saved. Try again.</Notice>
              )}
              {assignments.unassignedArticles.length === 0 ? (
                <Notice tone="info">Every open article has an assignee.</Notice>
              ) : (
                <ul className="divide-y">
                  {assignments.unassignedArticles.map((article) => {
                    const item = itemByKey.get(`article:${article.id}`)
                    return (
                      <li key={article.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                        <Link to={item?.to ?? '/dashboard/calendar'} className="min-w-0 truncate font-medium hover:underline">
                          {article.title}
                        </Link>
                        <select
                          aria-label={`Assign ${article.title}`}
                          className="rounded-md border bg-background px-2 py-1 text-sm"
                          value=""
                          disabled={assign.isPending || editors.isError}
                          onChange={(event) => {
                            if (event.target.value) {
                              assign.mutate({ articleId: article.id, assigneeId: event.target.value })
                            }
                          }}
                        >
                          <option value="">Assign to…</option>
                          {(editors.data ?? []).map((editor) => (
                            <option key={editor.id} value={editor.id}>
                              {editor.name}
                            </option>
                          ))}
                        </select>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        </Section>

        <Section title="Editorial performance" description="Trends, author reporting and quality analysis.">
          <p className="text-sm">
            <Link to="/dashboard/analytics" className="underline">
              Open Editorial Analytics
            </Link>
          </p>
        </Section>
      </div>
    </div>
  )
}
