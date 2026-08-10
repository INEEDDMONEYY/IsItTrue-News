import { ShieldAlert } from 'lucide-react'

export function ModerationPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-heading mb-1">Moderation</h1>
      <p className="text-sm text-text-muted mb-6">
        Review flagged comments and reported content once the comments API is connected.
      </p>

      <div className="rounded-2xl border border-dashed border-card-border bg-card p-10 flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-accent-bg flex items-center justify-center">
          <ShieldAlert className="w-6 h-6 text-accent" />
        </div>
        <h2 className="text-lg font-semibold text-card-heading">Moderation queue is coming soon</h2>
        <p className="text-sm text-card-text-muted max-w-md">
          Comments are currently mock data on the frontend. This page will surface reported
          comments and articles for review, approval, or removal once the comments API is
          built out.
        </p>
      </div>
    </div>
  )
}
