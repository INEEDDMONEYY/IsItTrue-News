import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import dayjs from '@/lib/dayjs'
import type { AdminArticleRow, AdminArticleSortField, SortOrder } from '../types/adminArticle.types'
import { ArticleStatusBadge, FactCheckBadge } from './ArticleStatusBadge'

interface ArticleTableProps {
  articles: AdminArticleRow[]
  sort: AdminArticleSortField
  order: SortOrder
  onSort: (field: AdminArticleSortField) => void
  // Dims the rows while a newer page or filter is loading.
  isRefreshing: boolean
}

const COLUMN_CLASS = 'px-4 py-3 font-medium whitespace-nowrap'

function SortHeader({
  field,
  label,
  sort,
  order,
  onSort,
  align = 'left',
}: {
  field: AdminArticleSortField
  label: string
  sort: AdminArticleSortField
  order: SortOrder
  onSort: (field: AdminArticleSortField) => void
  align?: 'left' | 'right'
}) {
  const active = sort === field
  const Icon = !active ? ArrowUpDown : order === 'asc' ? ArrowUp : ArrowDown
  return (
    <th
      scope="col"
      aria-sort={active ? (order === 'asc' ? 'ascending' : 'descending') : 'none'}
      className={`${COLUMN_CLASS} ${align === 'right' ? 'text-right' : ''}`}
    >
      <button
        type="button"
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-1.5 font-medium hover:text-accent transition-colors ${active ? 'text-card-heading' : ''}`}
      >
        {label}
        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    </th>
  )
}

export function ArticleTable({ articles, sort, order, onSort, isRefreshing }: ArticleTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-card-border bg-card">
      <table className={`w-full text-sm transition-opacity ${isRefreshing ? 'opacity-60' : ''}`} aria-busy={isRefreshing}>
        <thead className="bg-card-2 text-left text-card-text-muted">
          <tr>
            <SortHeader field="title" label="Article" sort={sort} order={order} onSort={onSort} />
            <th scope="col" className={COLUMN_CLASS}>
              Author
            </th>
            <th scope="col" className={COLUMN_CLASS}>
              Status
            </th>
            <th scope="col" className={COLUMN_CLASS}>
              Fact-check
            </th>
            <SortHeader field="views" label="Views" sort={sort} order={order} onSort={onSort} align="right" />
            <SortHeader field="createdAt" label="Created" sort={sort} order={order} onSort={onSort} />
            <SortHeader field="updatedAt" label="Updated" sort={sort} order={order} onSort={onSort} />
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => (
            <tr key={article.id} className="border-t border-card-border hover:bg-card-2/60 transition-colors">
              <td className="px-4 py-3 max-w-[26rem]">
                <Link
                  to={`/admin/articles/${article.id}`}
                  className="font-medium text-card-heading hover:text-accent transition-colors line-clamp-2"
                >
                  {article.title}
                </Link>
                <span className="text-xs text-card-text-muted">{article.category}</span>
              </td>
              <td className="px-4 py-3 text-card-text-muted whitespace-nowrap">
                {article.author?.name ?? <span className="italic">Deleted user</span>}
              </td>
              <td className="px-4 py-3">
                <ArticleStatusBadge status={article.status} />
              </td>
              <td className="px-4 py-3">
                <FactCheckBadge status={article.factCheckStatus} />
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-card-text-muted">{article.views.toLocaleString()}</td>
              <td className="px-4 py-3 text-card-text-muted whitespace-nowrap" title={dayjs(article.createdAt).format('MMM D, YYYY h:mm A')}>
                {dayjs(article.createdAt).format('MMM D, YYYY')}
              </td>
              <td className="px-4 py-3 text-card-text-muted whitespace-nowrap" title={dayjs(article.updatedAt).format('MMM D, YYYY h:mm A')}>
                {dayjs(article.updatedAt).fromNow()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
