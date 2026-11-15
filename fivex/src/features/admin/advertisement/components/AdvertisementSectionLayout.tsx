import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { ADVERTISEMENT_SECTIONS, type AdvertisementSection } from '../utils/advertisementSections'
import { STATUS_LABEL } from '../utils/advertisementStatus'

interface AdvertisementSectionLayoutProps {
  section: AdvertisementSection
  showHeader?: boolean
  children: ReactNode
}

export function AdvertisementSectionLayout({ section, showHeader = true, children }: AdvertisementSectionLayoutProps) {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          {showHeader ? <h1 className="text-2xl font-bold text-foreground">{section.title}</h1> : null}
          <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium">{STATUS_LABEL[section.status]}</span>
        </div>
        <p className="text-sm text-muted-foreground">{section.purpose}</p>
      </header>
      <nav aria-label="Advertisement sections" className="flex flex-wrap gap-2">
        {ADVERTISEMENT_SECTIONS.map((item) => (
          <NavLink
            key={item.route}
            to={'/admin/advertisement/' + item.route}
            className={({ isActive }) =>
              'rounded-md px-3 py-1.5 text-sm ' + (isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')
            }
          >
            {item.title}
          </NavLink>
        ))}
      </nav>
      {children}
    </div>
  )
}
