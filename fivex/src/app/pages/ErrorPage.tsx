import { AlertTriangle, ArrowLeft, RotateCw } from 'lucide-react'
import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'

export function ErrorPage() {
  const error = useRouteError()

  const status = isRouteErrorResponse(error) ? error.status : undefined

  const message = isRouteErrorResponse(error)
    ? error.statusText || String(error.data)
    : error instanceof Error
      ? error.message
      : 'An unexpected error occurred.'

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-surface)] px-6">
      <section className="w-full max-w-lg rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-red-600">
          {status ? `Error ${status}` : 'Something went wrong'}
        </p>

        <h1 className="mb-3 text-2xl font-bold text-[var(--color-heading)]">
          We hit a snag loading this page
        </h1>

        <p className="mb-8 text-sm leading-6 text-[var(--color-text-muted)]">
          {message}
        </p>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-card-border)] px-5 py-2.5 text-sm font-semibold text-[var(--color-card-heading)] transition hover:bg-[var(--color-surface-2)]"
          >
            <RotateCw className="h-4 w-4" />
            Reload page
          </button>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </section>
    </main>
  )
}
