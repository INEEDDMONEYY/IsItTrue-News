import {
  CheckCircle2,
  ShieldCheck,
  SearchCheck,
} from 'lucide-react'
import type { AuthorStatus } from '../../types/authorSettings.types'

interface AuthorStatusSectionProps {
  status: AuthorStatus
}

export function AuthorStatusSection({
  status,
}: AuthorStatusSectionProps) {
  return (
    <section className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[var(--color-card-heading)]">
          Author Status
        </h2>

        <p className="mt-1 text-sm leading-6 text-[var(--color-card-text-muted)]">
          Your current editorial access and standing on IsItTrue News.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatusCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Author status"
          value={formatStatus(status.status)}
        />

        <StatusCard
          icon={<ShieldCheck className="h-5 w-5" />}
          label="Editorial standing"
          value={formatStatus(status.editorialStatus)}
        />

        <StatusCard
          icon={<SearchCheck className="h-5 w-5" />}
          label="Fact-check access"
          value={status.factCheckAccess ? 'Enabled' : 'Restricted'}
        />

        <StatusCard
          icon={<SearchCheck className="h-5 w-5" />}
          label="Investigation access"
          value={
            status.investigationAccess
              ? 'Enabled'
              : 'Restricted'
          }
        />
      </div>
    </section>
  )
}

function StatusCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-[var(--color-card-border)] p-4">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
        {icon}
      </div>

      <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-card-text-muted)]">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-[var(--color-card-heading)]">
        {value}
      </p>
    </div>
  )
}

function formatStatus(value: string) {
  return value
    .split('-')
    .map(
      (part) =>
        part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(' ')
}