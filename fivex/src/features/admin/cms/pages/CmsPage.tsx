import { FileText } from 'lucide-react'

export function CmsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-heading mb-1">CMS</h1>
      <p className="text-sm text-text-muted mb-6">
        Create, edit, and publish articles once the content API is connected.
      </p>

      <div className="rounded-2xl border border-dashed border-card-border bg-card p-10 flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-accent-bg flex items-center justify-center">
          <FileText className="w-6 h-6 text-accent" />
        </div>
        <h2 className="text-lg font-semibold text-card-heading">Content management is coming soon</h2>
        <p className="text-sm text-card-text-muted max-w-md">
          Articles are currently mock data on the frontend. This page will let you create
          categories, draft articles, and manage publication status once the articles API
          is built out.
        </p>
      </div>
    </div>
  )
}
