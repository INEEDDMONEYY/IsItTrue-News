import type { ReactNode } from 'react'

interface RecordSectionProps {
  id: string
  number: number
  title: string
  action?: ReactNode
  children: ReactNode
}

// One numbered section of a fact-check record. Each is a labelled region, so it can be jumped to and announced.
export function RecordSection({ id, number, title, action, children }: RecordSectionProps) {
  return (
    <section aria-labelledby={`${id}-heading`} className="rounded-2xl border border-card-border bg-card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 id={`${id}-heading`} className="text-sm font-semibold text-card-heading">
          <span className="mr-2 text-card-text-dim tabular-nums">{number}.</span>{' '}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="py-2 border-b border-card-border last:border-0">
      <dt className="text-xs text-card-text-dim mb-0.5">{label}</dt>
      <dd className="text-sm text-card-text break-words whitespace-pre-line">{children}</dd>
    </div>
  )
}

export const NotRecorded = () => <span className="italic text-card-text-dim">Not recorded</span>
