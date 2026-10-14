import type {
  AdminArticleListParams,
  AdminArticleSortField,
  AdminArticleStatus,
  AdminFactCheckStatus,
  SortOrder,
} from '../types/adminArticle.types'
import { FACT_CHECK_ORDER, STATUS_ORDER } from './articleLabels'

export const PAGE_SIZES = [20, 50, 100] as const
export const DEFAULT_PARAMS: AdminArticleListParams = {
  sort: 'createdAt',
  order: 'desc',
  page: 1,
  pageSize: 20,
}

const SORT_FIELDS: AdminArticleSortField[] = ['createdAt', 'updatedAt', 'views', 'title']

function pick<T extends string>(value: string | null, allowed: readonly T[]): T | undefined {
  return allowed.find((option) => option === value)
}

function positiveInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

// The address bar is the source of truth for the filters, so a reload, the back button and a shared link all
// land on the same view. Anything unrecognised falls back to the default instead of breaking the page.
export function paramsFromSearch(search: URLSearchParams): AdminArticleListParams {
  const pageSize = positiveInt(search.get('pageSize'), DEFAULT_PARAMS.pageSize)
  const from = search.get('from')
  const to = search.get('to')
  return {
    q: search.get('q')?.trim().slice(0, 100) || undefined,
    status: pick<AdminArticleStatus>(search.get('status'), STATUS_ORDER),
    category: search.get('category')?.slice(0, 100) || undefined,
    factCheckStatus: pick<AdminFactCheckStatus>(search.get('factCheck'), FACT_CHECK_ORDER),
    from: from && DATE_PATTERN.test(from) ? from : undefined,
    to: to && DATE_PATTERN.test(to) ? to : undefined,
    sort: pick(search.get('sort'), SORT_FIELDS) ?? DEFAULT_PARAMS.sort,
    order: pick<SortOrder>(search.get('order'), ['asc', 'desc']) ?? DEFAULT_PARAMS.order,
    page: Math.min(positiveInt(search.get('page'), 1), 10_000),
    pageSize: PAGE_SIZES.find((size) => size === pageSize) ?? DEFAULT_PARAMS.pageSize,
  }
}

// Only what differs from the defaults goes in the address, to keep links short.
export function searchFromParams(params: AdminArticleListParams): URLSearchParams {
  const search = new URLSearchParams()
  if (params.q) search.set('q', params.q)
  if (params.status) search.set('status', params.status)
  if (params.category) search.set('category', params.category)
  if (params.factCheckStatus) search.set('factCheck', params.factCheckStatus)
  if (params.from) search.set('from', params.from)
  if (params.to) search.set('to', params.to)
  if (params.sort !== DEFAULT_PARAMS.sort) search.set('sort', params.sort)
  if (params.order !== DEFAULT_PARAMS.order) search.set('order', params.order)
  if (params.page !== 1) search.set('page', String(params.page))
  if (params.pageSize !== DEFAULT_PARAMS.pageSize) search.set('pageSize', String(params.pageSize))
  return search
}

export function hasActiveFilters(params: AdminArticleListParams): boolean {
  return Boolean(params.q || params.status || params.category || params.factCheckStatus || params.from || params.to)
}
