import { Link } from 'react-router-dom'

interface CmsBreadcrumbProps {
  current: string
}

const CMS_TRAIL = [
  { label: 'Admin', to: '/admin' },
  { label: 'CMS', to: '/admin/cms' },
]

export function CmsBreadcrumb({ current }: CmsBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-text-muted">
        {CMS_TRAIL.map((item) => (
          <li key={item.to} className="flex items-center gap-1.5">
            <Link to={item.to} className="hover:text-accent hover:underline">
              {item.label}
            </Link>
            <span aria-hidden="true" className="select-none">/</span>
          </li>
        ))}
        <li>
          <span aria-current="page" className="text-heading">
            {current}
          </span>
        </li>
      </ol>
    </nav>
  )
}
