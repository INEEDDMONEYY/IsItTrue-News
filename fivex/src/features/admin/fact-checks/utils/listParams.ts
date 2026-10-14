import type {
  AssessmentStatus,
  ClaimPriority,
  EvidenceState,
  FactCheckListParams,
  FactCheckSortField,
  FactCheckView,
  SortOrder,
  WorkflowStatus,
} from '../types/factCheck.types'
import { ALL_VIEWS, ASSESSMENT_ORDER, EVIDENCE_STATE_ORDER, PRIORITY_ORDER, WORKFLOW_ORDER } from './factCheckLabels'

export const PAGE_SIZES = [20, 50, 100] as const
export const DEFAULT_PARAMS: FactCheckListParams = {
  view: 'all',
  sort: 'updatedAt',
  order: 'desc',
  page: 1,
  pageSize: 20,
}

export const SORT_OPTIONS: { value: FactCheckSortField; label: string }[] = [
  { value: 'updatedAt', label: 'Last updated' },
  { value: 'priority', label: 'Priority' },
  { value: 'dueAt', label: 'Deadline' },
  { value: 'createdAt', label: 'Created' },
]

const SORT_FIELDS = SORT_OPTIONS.map((option) => option.value)
const OBJECT_ID = /^[a-f\d]{24}$/i

function pick<T extends string>(value: string | null, allowed: readonly T[]): T | undefined {
  return allowed.find((option) => option === value)
}

function positiveInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

// The address bar is the source of truth for the filters, so a reload, the back button and a shared link all
// land on the same view. Anything unrecognised falls back to the default instead of breaking the page.
export function paramsFromSearch(search: URLSearchParams): FactCheckListParams {
  const pageSize = positiveInt(search.get('pageSize'), DEFAULT_PARAMS.pageSize)
  const assignee = search.get('assignee')
  return {
    view: pick<FactCheckView>(search.get('view'), ALL_VIEWS) ?? 'all',
    q: search.get('q')?.trim().slice(0, 100) || undefined,
    workflow: pick<WorkflowStatus>(search.get('workflow'), WORKFLOW_ORDER),
    assessment: pick<AssessmentStatus>(search.get('assessment'), ASSESSMENT_ORDER),
    evidence: pick<EvidenceState>(search.get('evidence'), EVIDENCE_STATE_ORDER),
    priority: pick<ClaimPriority>(search.get('priority'), PRIORITY_ORDER),
    assignee: assignee === 'unassigned' || (assignee && OBJECT_ID.test(assignee)) ? assignee : undefined,
    sort: pick<FactCheckSortField>(search.get('sort'), SORT_FIELDS) ?? DEFAULT_PARAMS.sort,
    order: pick<SortOrder>(search.get('order'), ['asc', 'desc']) ?? DEFAULT_PARAMS.order,
    page: Math.min(positiveInt(search.get('page'), 1), 10_000),
    pageSize: PAGE_SIZES.find((size) => size === pageSize) ?? DEFAULT_PARAMS.pageSize,
  }
}

// Only what differs from the defaults goes in the address, to keep links short.
export function searchFromParams(params: FactCheckListParams): URLSearchParams {
  const search = new URLSearchParams()
  if (params.view !== 'all') search.set('view', params.view)
  if (params.q) search.set('q', params.q)
  if (params.workflow) search.set('workflow', params.workflow)
  if (params.assessment) search.set('assessment', params.assessment)
  if (params.evidence) search.set('evidence', params.evidence)
  if (params.priority) search.set('priority', params.priority)
  if (params.assignee) search.set('assignee', params.assignee)
  if (params.sort !== DEFAULT_PARAMS.sort) search.set('sort', params.sort)
  if (params.order !== DEFAULT_PARAMS.order) search.set('order', params.order)
  if (params.page !== 1) search.set('page', String(params.page))
  if (params.pageSize !== DEFAULT_PARAMS.pageSize) search.set('pageSize', String(params.pageSize))
  return search
}

export function hasActiveFilters(params: FactCheckListParams): boolean {
  return Boolean(
    params.view !== 'all' || params.q || params.workflow || params.assessment || params.evidence || params.priority || params.assignee,
  )
}
