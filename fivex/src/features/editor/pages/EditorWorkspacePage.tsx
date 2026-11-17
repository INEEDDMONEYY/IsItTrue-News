import { Link } from 'react-router-dom'
import { CalendarDays, FileCheck2, BriefcaseBusiness, ShieldCheck } from 'lucide-react'
import { WorkspaceOverview } from '../components/WorkspaceOverview'

const WORKSPACE_LINKS = [
  {
    to: '/dashboard/calendar',
    label: 'Editorial Calendar',
    description: 'Month, week, and day views of editorial deadlines and workflow stages.',
    icon: CalendarDays,
  },
  {
    to: '/dashboard/fact-check-oversight',
    label: 'Fact Check Oversight',
    description: 'Claims under verification, their status, and the evidence behind them.',
    icon: ShieldCheck,
  },
  {
    to: '/dashboard/investigation-oversight',
    label: 'Investigation Oversight',
    description: 'Investigations awaiting an editorial publish decision.',
    icon: BriefcaseBusiness,
  },
  {
    to: '/dashboard/corrections',
    label: 'Corrections & Flagged Articles',
    description: 'Corrections management and articles flagged for review.',
    icon: FileCheck2,
  },
]

export function EditorWorkspacePage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Workspace</h1>
        <p className="text-sm text-muted-foreground">
          Editorial planning, fact-check, investigation, and correction oversight in one place.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {WORKSPACE_LINKS.map(({ to, label, description, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-start gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span>
              <span className="block font-medium">{label}</span>
              <span className="block text-sm text-muted-foreground">{description}</span>
            </span>
          </Link>
        ))}
      </div>
      <WorkspaceOverview />
    </div>
  )
}
