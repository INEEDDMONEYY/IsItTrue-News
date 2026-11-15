import type { ReactNode } from 'react'
import { getErrorMessage } from '@/lib/getErrorMessage'

interface AdvertisementQueryStateProps {
  isLoading: boolean
  error: unknown
  isEmpty?: boolean
  emptyMessage?: string
  children: ReactNode
}

/** Shared loading, error, and empty handling so each page reports failures the same way. */
export function AdvertisementQueryState({ isLoading, error, isEmpty, emptyMessage, children }: AdvertisementQueryStateProps) {
  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>
  if (error) {
    return (
      <p role="alert" className="rounded-md border border-destructive/40 p-3 text-sm text-destructive">
        {getErrorMessage(error, 'Could not load this data.')}
      </p>
    )
  }
  if (isEmpty) return <p className="text-sm text-muted-foreground">{emptyMessage ?? 'Nothing to show yet.'}</p>
  return <>{children}</>
}

export function AdvertisementPill({ children }: { children: ReactNode }) {
  return <span className="whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium">{children}</span>
}

export function AdvertisementStatCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
      {note ? <p className="mt-1 text-xs text-muted-foreground">{note}</p> : null}
    </div>
  )
}
