import { Link } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, ClipboardList, Clock, FileQuestion, Flag, Hourglass, Loader2, RotateCcw, ShieldAlert, UserX, type LucideIcon } from 'lucide-react'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { useFactCheckOverview } from '../hooks/useAdminFactChecks'
import type { FactCheckView } from '../types/factCheck.types'
import { ATTENTION_VIEWS, PRIMARY_VIEWS, VIEW_INFO } from '../utils/factCheckLabels'

const ICONS: Record<FactCheckView, LucideIcon> = {
  all: ClipboardList,
  pending: Hourglass,
  in_progress: Loader2,
  disputed: ShieldAlert,
  unresolved: FileQuestion,
  overdue: Clock,
  completed_recently: CheckCircle2,
  escalated: AlertTriangle,
  returned: RotateCcw,
  evidence_flagged: Flag,
  unassigned: UserX,
}

function MetricCard({ view, count, active, compact = false }: { view: FactCheckView; count: number | undefined; active: boolean; compact?: boolean }) {
  const Icon = ICONS[view]
  const info = VIEW_INFO[view]
  // "all" is the unfiltered list, so it links to the bare address.
  const to = view === 'all' ? '/admin/fact-checks' : `/admin/fact-checks?view=${view}`
  return (
    <Link
      to={to}
      aria-current={active ? 'true' : undefined}
      title={info.hint}
      className={`group flex flex-col gap-1 rounded-2xl border bg-card p-4 transition-colors hover:border-accent-border ${
        active ? 'border-accent ring-2 ring-accent-border' : 'border-card-border'
      }`}
    >
      <span className="flex items-center justify-between gap-2 text-xs font-medium text-card-text-muted">
        {info.label}
        <Icon className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
      </span>
      <span className={`${compact ? 'text-xl' : 'text-2xl'} font-semibold text-card-heading tabular-nums`}>
        {count === undefined ? '–' : count.toLocaleString()}
      </span>
    </Link>
  )
}

// The overview: each number is the size of the list it opens, and the card for the list being shown is marked.
export function FactCheckOverview({ activeView }: { activeView: FactCheckView }) {
  const { data, error } = useFactCheckOverview()

  return (
    <section aria-label="Overview" className="flex flex-col gap-3 mb-6">
      {error && !data && (
        <p role="alert" className="text-sm text-disputed">
          {getErrorMessage(error, 'Failed to load the overview.')}
        </p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
        {PRIMARY_VIEWS.map((view) => (
          <MetricCard key={view} view={view} count={data?.counts[view]} active={activeView === view} />
        ))}
      </div>
      <div>
        <h2 className="text-xs font-medium uppercase tracking-wide text-text-dim mb-2">Needs an admin</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ATTENTION_VIEWS.map((view) => (
            <MetricCard key={view} view={view} count={data?.counts[view]} active={activeView === view} compact />
          ))}
        </div>
      </div>
    </section>
  )
}
