import { Link } from 'react-router-dom'

const CMS_MODULES = [
  { to: '/admin/cms/page-management', title: 'Page Management', description: 'Static pages, revisions, and metadata.' },
  { to: '/admin/cms/homepage', title: 'Homepage', description: 'Hero stories, sections, and banners.' },
  { to: '/admin/cms/navigation', title: 'Navigation', description: 'Header, footer, and mobile menus.' },
  { to: '/admin/cms/global-content', title: 'Global Content', description: 'Announcements, newsletter, and footer copy.' },
  { to: '/admin/cms/media', title: 'Media & Assets', description: 'Logos, banners, and thumbnails.' },
  { to: '/admin/cms/article-presentation', title: 'Article Presentation', description: 'Featured placement and recommendations.' },
  { to: '/admin/cms/configuration', title: 'Platform Configuration', description: 'Display preferences and content limits.' },
  { to: '/admin/cms/tags', title: 'Tags', description: 'Article tags and their usage.' },
  { to: '/admin/cms/categories', title: 'Categories', description: 'Article categories used across the site.' },
  { to: '/admin/cms/developer-tools', title: 'Developer Tools', description: 'Engagement settings and testing utilities.' },
]

export function CmsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-heading mb-1">CMS</h1>
      <p className="text-sm text-text-muted mb-6">
        Choose a CMS module to manage the site's content and settings.
      </p>

      <nav aria-label="CMS modules" className="mb-8">
        <h2 className="text-sm font-semibold text-heading mb-3">Modules</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CMS_MODULES.map((module) => (
            <li key={module.to}>
              <Link
                to={module.to}
                className="block h-full rounded-xl border border-card-border bg-card p-4 transition-colors hover:border-accent"
              >
                <span className="block text-sm font-medium text-card-heading">{module.title}</span>
                <span className="mt-1 block text-xs text-card-text-muted">{module.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
