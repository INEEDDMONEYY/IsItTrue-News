import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { getDashboardBreadcrumbs } from '../constants/dashboardNav'

export function DashboardBreadcrumbs({ role }: { role: string | undefined }) {
  const { pathname } = useLocation()
  const trail = getDashboardBreadcrumbs(role, pathname)

  return (
    <nav aria-label="Breadcrumb" className="min-w-0 overflow-hidden">
      <ol className="flex items-center gap-1.5 whitespace-nowrap text-sm">
        {trail.map((crumb, index) => {
          const isCurrent = index === trail.length - 1
          return (
            <li key={`${index}-${crumb.to}`} className="flex min-w-0 items-center gap-1.5">
              {index > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-text-dim" aria-hidden="true" />}
              {isCurrent ? (
                <span aria-current="page" className="truncate font-medium text-heading">
                  {crumb.label}
                </span>
              ) : (
                <Link to={crumb.to} className="truncate text-text-muted transition-colors hover:text-text">
                  {crumb.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
