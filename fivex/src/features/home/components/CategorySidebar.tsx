import { NavLink } from 'react-router-dom'
import type { Category } from '@/shared/types/article.types'

export function CategorySidebar({ categories }: { categories: Category[] }) {
  return (
    <div className="rounded-2xl border border-card-border bg-card p-4">
      <h3 className="text-sm font-semibold text-card-heading mb-3">Category</h3>
      <ul className="flex flex-col gap-1">
        {categories.map((cat) => (
          <li key={cat.id}>
            <NavLink
              to={`/category/${cat.slug}`}
              className={({ isActive }) =>
                `block px-2 py-1.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-accent-bg text-accent'
                    : 'text-card-text-muted hover:text-card-text hover:bg-card-2'
                }`
              }
            >
              {cat.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  )
}