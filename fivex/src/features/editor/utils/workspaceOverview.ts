import {
  ARTICLE_EDITORIAL_STAGES,
  INVESTIGATION_WORKFLOW_STAGES,
  type ArticleEditorialStage,
  type ArticleWorkflowItem,
  type EditorAccount,
  type InvestigationWorkflowItem,
  type InvestigationWorkflowStage,
} from '../types/calendar.types'
import {
  CLAIM_STATUSES,
  isOpenClaim,
  type Claim,
  type ClaimStatus,
  type FactCheckArticle,
} from '../types/claim.types'

export const UPCOMING_WINDOW_DAYS = 30

const DAY_MS = 24 * 60 * 60 * 1000

export interface WorkspaceSnapshot {
  userId: string
  now: number
  articles: ArticleWorkflowItem[]
  investigations: InvestigationWorkflowItem[]
  // Ids of investigations the signed-in user authors or collaborates on (from the "mine" endpoint).
  myInvestigationIds: ReadonlySet<string>
  claims: Claim[]
  factCheckArticles: FactCheckArticle[]
}

export type WorkItemKind = 'article' | 'investigation' | 'claim'

export interface WorkItem {
  key: string
  kind: WorkItemKind
  title: string
  to: string
  deadline?: string
  open: boolean
  overdue: boolean
  escalated: boolean
  returned: boolean
  mine: boolean
  rank: number
}

export interface WorkloadCounts {
  openArticles: number
  openInvestigations: number
  openClaims: number
  overdue: number
  escalated: number
  returned: number
}

export function isOverdue(deadline: string | undefined, now: number): boolean {
  return Boolean(deadline) && Date.parse(deadline as string) < now
}

export function isArticleOpen(article: ArticleWorkflowItem): boolean {
  return article.status !== 'published' && article.editorialStage !== 'published'
}

export function isInvestigationOpen(investigation: InvestigationWorkflowItem): boolean {
  return investigation.status !== 'published' && investigation.status !== 'rejected'
}

function articleLink(article: ArticleWorkflowItem, mine: boolean): string {
  if (mine) return `/dashboard/articles/${article.id}/edit`
  if (article.editorialStage === 'reviewing') return '/dashboard/review'
  if (article.editorialStage === 'fact_checking') return '/dashboard/fact-check-oversight'
  return '/dashboard/calendar'
}

// Ranks exceptions above routine open work, so overdue, escalated and returned items come first.
function rankOf(item: { overdue: boolean; escalated: boolean; returned: boolean; mine: boolean }): number {
  if (item.overdue) return 0
  if (item.escalated) return 1
  if (item.returned) return 2
  return 3
}

export function buildWorkItems(snapshot: WorkspaceSnapshot): WorkItem[] {
  const { now, userId } = snapshot

  const articleItems = snapshot.articles.map((article): WorkItem => {
    const open = isArticleOpen(article)
    const mine = article.author?.id === userId
    const overdue = open && isOverdue(article.editorialDeadline, now)
    const base = { overdue, escalated: false, returned: false, mine }
    return {
      key: `article:${article.id}`,
      kind: 'article',
      title: article.title,
      to: articleLink(article, mine),
      deadline: article.editorialDeadline,
      open,
      ...base,
      rank: rankOf(base),
    }
  })

  const investigationItems = snapshot.investigations.map((investigation): WorkItem => {
    const open = isInvestigationOpen(investigation)
    const mine = snapshot.myInvestigationIds.has(investigation.id)
    const overdue = open && isOverdue(investigation.editorialDeadline, now)
    const base = { overdue, escalated: false, returned: false, mine }
    return {
      key: `investigation:${investigation.id}`,
      kind: 'investigation',
      title: investigation.title,
      to: mine ? `/dashboard/investigations/${investigation.id}` : '/dashboard/investigation-oversight',
      deadline: investigation.editorialDeadline,
      open,
      ...base,
      rank: rankOf(base),
    }
  })

  const claimItems = snapshot.claims.map((claim): WorkItem => {
    const open = isOpenClaim(claim.status)
    const mine = claim.assignee?.id === userId
    const overdue = open && isOverdue(claim.dueAt, now)
    const escalated = claim.workflowStatus === 'escalated'
    const returned = claim.workflowStatus === 'returned'
    const base = { overdue, escalated, returned, mine }
    return {
      key: `claim:${claim.id}`,
      kind: 'claim',
      title: claim.text,
      to: '/dashboard/fact-check-oversight',
      deadline: claim.dueAt,
      open,
      ...base,
      rank: rankOf(base),
    }
  })

  return [...articleItems, ...investigationItems, ...claimItems]
}

// Work requiring action: the user's open items, plus every overdue, escalated or returned item from the team.
export function selectPriorityTasks(items: WorkItem[]): WorkItem[] {
  return items
    .filter((item) => item.overdue || item.escalated || item.returned || (item.mine && item.open))
    .sort((a, b) => a.rank - b.rank || (a.deadline ?? '').localeCompare(b.deadline ?? ''))
}

export function summarizeWorkload(items: WorkItem[]): WorkloadCounts {
  return {
    openArticles: items.filter((item) => item.kind === 'article' && item.open).length,
    openInvestigations: items.filter((item) => item.kind === 'investigation' && item.open).length,
    openClaims: items.filter((item) => item.kind === 'claim' && item.open).length,
    overdue: items.filter((item) => item.overdue).length,
    escalated: items.filter((item) => item.escalated).length,
    returned: items.filter((item) => item.returned).length,
  }
}

export function countArticlesByStage(articles: ArticleWorkflowItem[]): Record<ArticleEditorialStage, number> {
  const counts = Object.fromEntries(ARTICLE_EDITORIAL_STAGES.map((stage) => [stage, 0])) as Record<
    ArticleEditorialStage,
    number
  >
  for (const article of articles) counts[article.editorialStage] += 1
  return counts
}

export function countInvestigationsByStage(
  investigations: InvestigationWorkflowItem[],
): Record<InvestigationWorkflowStage, number> {
  const counts = Object.fromEntries(INVESTIGATION_WORKFLOW_STAGES.map((stage) => [stage, 0])) as Record<
    InvestigationWorkflowStage,
    number
  >
  for (const investigation of investigations) {
    if (isInvestigationOpen(investigation)) counts[investigation.workflowStage] += 1
  }
  return counts
}

export function countClaimsByStatus(claims: Claim[]): Record<ClaimStatus, number> {
  const counts = Object.fromEntries(CLAIM_STATUSES.map((status) => [status, 0])) as Record<ClaimStatus, number>
  for (const claim of claims) counts[claim.status] += 1
  return counts
}

// Open items whose deadline falls within the window, including overdue ones, soonest first.
export function selectUpcomingDeadlines(items: WorkItem[], now: number): WorkItem[] {
  const horizon = now + UPCOMING_WINDOW_DAYS * DAY_MS
  return items
    .filter((item) => item.open && item.deadline && Date.parse(item.deadline) <= horizon)
    .sort((a, b) => Date.parse(a.deadline as string) - Date.parse(b.deadline as string))
}

export interface AssigneeWorkload {
  id: string
  name: string
  openArticles: number
}

export interface AssignmentSummary {
  unassignedArticles: ArticleWorkflowItem[]
  byEditor: AssigneeWorkload[]
}

// Open articles only. Every editor account appears, even with zero work; an assignee missing from the editor list is still shown.
export function summarizeAssignments(articles: ArticleWorkflowItem[], editors: EditorAccount[]): AssignmentSummary {
  const open = articles.filter(isArticleOpen)
  const unassignedArticles = open.filter((article) => !article.assignee?.id)
  const counts = new Map<string, AssigneeWorkload>(
    editors.map((editor) => [editor.id, { id: editor.id, name: editor.name, openArticles: 0 }]),
  )
  for (const article of open) {
    const id = article.assignee?.id
    if (!id) continue
    const entry = counts.get(id) ?? { id, name: article.assignee?.name ?? 'Unknown editor', openArticles: 0 }
    entry.openArticles += 1
    counts.set(id, entry)
  }
  const byEditor = [...counts.values()].sort((a, b) => b.openArticles - a.openArticles || a.name.localeCompare(b.name))
  return { unassignedArticles, byEditor }
}
