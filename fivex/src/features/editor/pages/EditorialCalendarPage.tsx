import { useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { PageLoader } from '@/components/loaders/PageLoader'
import { WorkflowCard } from '../components/EditorialCalendar'
import { useEditorialCalendar } from '../hooks/useEditorialCalendar'
import {
  ARTICLE_EDITORIAL_STAGES,
  INVESTIGATION_WORKFLOW_STAGES,
  articleStageLabels,
  investigationStageLabels,
} from '../types/calendar.types'
import type {
  ArticleEditorialStage,
  InvestigationWorkflowStage,
  EditorialCalendarItem,
  EditorialWorkflowUpdate,
} from '../types/calendar.types'

type CalendarView = 'month' | 'week' | 'day'
type DashboardPanel = 'calendar' | 'board' | 'investigations'

const articleStages: readonly ArticleEditorialStage[] = ARTICLE_EDITORIAL_STAGES
const investigationStages: readonly InvestigationWorkflowStage[] = INVESTIGATION_WORKFLOW_STAGES
const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function addDays(date: Date, amount: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

function startOfWeek(date: Date): Date {
  const monday = new Date(date)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  return monday
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function dateLabel(date: Date, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(undefined, options).format(date)
}

function deadlineKey(item: EditorialCalendarItem): string | undefined {
  return item.editorialDeadline?.slice(0, 10)
}

function workflowKey(item: EditorialCalendarItem): string {
  const stage = item.kind === 'article' ? item.editorialStage : item.workflowStage
  return `${item.id}:${stage}:${item.editorialDeadline ?? ''}`
}

function orderByDeadline(items: EditorialCalendarItem[]): EditorialCalendarItem[] {
  return [...items].sort((left, right) => {
    const leftDeadline = deadlineKey(left) ?? '9999-12-31'
    const rightDeadline = deadlineKey(right) ?? '9999-12-31'
    return leftDeadline.localeCompare(rightDeadline) || left.title.localeCompare(right.title)
  })
}

function CalendarItem({ item }: { item: EditorialCalendarItem }) {
  const stage = item.kind === 'article'
    ? articleStageLabels[item.editorialStage]
    : investigationStageLabels[item.workflowStage]
  return (
    <div className="truncate rounded-md bg-accent/10 px-2 py-1 text-left text-xs text-accent" title={`${item.title} · ${stage}`}>
      <span className="font-medium">{item.title}</span>
      <span className="ml-1 hidden sm:inline">· {stage}</span>
    </div>
  )
}

function CalendarGrid({
  view,
  selectedDate,
  items,
  onSelectDate,
}: {
  view: CalendarView
  selectedDate: Date
  items: EditorialCalendarItem[]
  onSelectDate: (date: Date) => void
}) {
  const visibleDates = useMemo(() => {
    if (view === 'day') return [selectedDate]
    if (view === 'week') return Array.from({ length: 7 }, (_, index) => addDays(startOfWeek(selectedDate), index))
    const firstOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    const firstCell = startOfWeek(firstOfMonth)
    return Array.from({ length: 42 }, (_, index) => addDays(firstCell, index))
  }, [view, selectedDate])

  const eventsByDate = useMemo(() => {
    const map = new Map<string, EditorialCalendarItem[]>()
    for (const item of orderByDeadline(items)) {
      const key = deadlineKey(item)
      if (!key) continue
      map.set(key, [...(map.get(key) ?? []), item])
    }
    return map
  }, [items])

  return (
    <div className="overflow-hidden rounded-xl border border-card-border bg-card">
      {view !== 'day' && (
        <div className="grid grid-cols-7 border-b border-card-border bg-background/60">
          {weekdayLabels.map((day) => (
            <div key={day} className="px-2 py-2 text-center text-xs font-medium text-text-muted">{day}</div>
          ))}
        </div>
      )}
      <div className={view === 'day' ? 'divide-y divide-card-border' : 'grid grid-cols-7'}>
        {visibleDates.map((date) => {
          const events = eventsByDate.get(dateKey(date)) ?? []
          const isOutOfMonth = view === 'month' && date.getMonth() !== selectedDate.getMonth()
          const isSelected = dateKey(date) === dateKey(selectedDate)
          return (
            <button
              key={dateKey(date)}
              type="button"
              onClick={() => onSelectDate(date)}
              className={`min-h-28 border-b border-r border-card-border p-2 text-left transition-colors hover:bg-background/60 ${
                view === 'day' ? 'min-h-32' : ''
              } ${isOutOfMonth ? 'bg-background/40 text-text-muted' : ''} ${isSelected ? 'ring-1 ring-inset ring-accent' : ''}`}
            >
              <div className="mb-2 flex items-center justify-between gap-1">
                <span className="text-xs font-medium text-heading">
                  {view === 'day' ? dateLabel(date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : date.getDate()}
                </span>
                {events.length > 0 && <span className="text-[10px] text-text-muted">{events.length} due</span>}
              </div>
              <div className={view === 'day' ? 'grid gap-2 sm:grid-cols-2' : 'grid gap-1'}>
                {events.slice(0, view === 'month' ? 3 : 12).map((item) => (
                  <CalendarItem key={`${item.kind}:${item.id}`} item={item} />
                ))}
                {events.length > (view === 'month' ? 3 : 12) && (
                  <span className="text-[10px] text-text-muted">+{events.length - (view === 'month' ? 3 : 12)} more</span>
                )}
                {view === 'day' && events.length === 0 && (
                  <span className="py-4 text-sm text-card-text-muted">No deadlines scheduled.</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function monthHeading(date: Date): string {
  return dateLabel(date, { month: 'long', year: 'numeric' })
}

function rangeHeading(view: CalendarView, date: Date): string {
  if (view === 'month') return monthHeading(date)
  if (view === 'day') return dateLabel(date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const start = startOfWeek(date)
  const end = addDays(start, 6)
  return `${dateLabel(start, { month: 'short', day: 'numeric' })} – ${dateLabel(end, { month: 'short', day: 'numeric', year: 'numeric' })}`
}

function shiftDate(view: CalendarView, date: Date, direction: -1 | 1): Date {
  if (view === 'month') return new Date(date.getFullYear(), date.getMonth() + direction, 1)
  if (view === 'week') return addDays(date, direction * 7)
  return addDays(date, direction)
}

function CalendarPanel({
  items,
  onSave,
  isSaving,
}: {
  items: EditorialCalendarItem[]
  onSave: (workflow: EditorialWorkflowUpdate) => Promise<void>
  isSaving: boolean
}) {
  const [view, setView] = useState<CalendarView>('month')
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const datedItems = items.filter((item) => item.editorialDeadline)
  const unscheduledItems = orderByDeadline(items.filter((item) => !item.editorialDeadline))

  return (
    <section aria-label="Editorial calendar">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous period"
            onClick={() => setSelectedDate((date) => shiftDate(view, date, -1))}
            className="rounded-lg border border-border p-2 text-text-muted hover:text-heading"
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setSelectedDate(new Date())}
            className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-text-muted hover:text-heading"
          >
            Today
          </button>
          <button
            type="button"
            aria-label="Next period"
            onClick={() => setSelectedDate((date) => shiftDate(view, date, 1))}
            className="rounded-lg border border-border p-2 text-text-muted hover:text-heading"
          >
            <ChevronRight aria-hidden="true" className="size-4" />
          </button>
          <h2 className="ml-1 text-base font-semibold text-heading">{rangeHeading(view, selectedDate)}</h2>
        </div>
        <div className="flex rounded-lg border border-border p-1" aria-label="Calendar view">
          {(['month', 'week', 'day'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={view === mode}
              onClick={() => setView(mode)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize ${
                view === mode ? 'bg-brand-gradient text-on-brand' : 'text-text-muted hover:text-heading'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
      <CalendarGrid view={view} selectedDate={selectedDate} items={datedItems} onSelectDate={setSelectedDate} />
      <p className="mt-3 text-xs text-text-muted">
        {datedItems.length} workflow {datedItems.length === 1 ? 'item has' : 'items have'} a deadline.
        {isSaving ? ' Saving changes…' : ''}
      </p>
      <div className="mt-6">
        <h3 className="mb-1 text-base font-semibold text-heading">Unscheduled workflow</h3>
        <p className="mb-3 text-sm text-text-muted">Set a deadline on an article or investigation to add it to this calendar.</p>
        {unscheduledItems.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {unscheduledItems.map((item) => (
              <WorkflowCard key={workflowKey(item)} item={item} onSave={onSave} isSaving={isSaving} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-card-border bg-card p-4 text-sm text-card-text-muted">
            Every workflow item has a deadline.
          </p>
        )}
      </div>
    </section>
  )
}

function EditorialBoard({
  items,
  onSave,
  isSaving,
}: {
  items: EditorialCalendarItem[]
  onSave: (workflow: EditorialWorkflowUpdate) => Promise<void>
  isSaving: boolean
}) {
  const articles = orderByDeadline(items.filter((item) => item.kind === 'article'))
  return (
    <section aria-label="Editorial board">
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-heading">Editorial board</h2>
        <p className="text-sm text-text-muted">Move article workflow records through each editorial stage and attach a deadline.</p>
      </div>
      <div className="grid gap-3 overflow-x-auto pb-2 md:grid-cols-2 2xl:grid-cols-3">
        {articleStages.map((stage) => {
          const laneItems = articles.filter((item) => item.kind === 'article' && item.editorialStage === stage)
          return (
            <section key={stage} className="min-w-0 rounded-xl border border-card-border bg-background/40 p-3">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-heading">{articleStageLabels[stage]}</h3>
                <span className="rounded-full bg-card px-2 py-0.5 text-xs text-text-muted">{laneItems.length}</span>
              </div>
              <div className="grid gap-3">
                {laneItems.length ? laneItems.map((item) => (
                  <WorkflowCard key={workflowKey(item)} item={item} onSave={onSave} isSaving={isSaving} />
                )) : <p className="py-4 text-center text-xs text-text-muted">No articles in this stage.</p>}
              </div>
            </section>
          )
        })}
      </div>
    </section>
  )
}

function InvestigationTimeline({
  items,
  onSave,
  isSaving,
}: {
  items: EditorialCalendarItem[]
  onSave: (workflow: EditorialWorkflowUpdate) => Promise<void>
  isSaving: boolean
}) {
  const investigations = orderByDeadline(items.filter((item) => item.kind === 'investigation'))
  return (
    <section aria-label="Investigation timeline">
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-heading">Investigation timeline</h2>
        <p className="text-sm text-text-muted">Track each investigation’s current phase and keep its deadline on the investigation record.</p>
      </div>
      <div className="grid gap-3">
        {investigationStages.map((stage, index) => {
          const laneItems = investigations.filter((item) => item.kind === 'investigation' && item.workflowStage === stage)
          return (
            <section key={stage} className="rounded-xl border border-card-border bg-background/40 p-3">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">{index + 1}</span>
                <h3 className="text-sm font-semibold text-heading">{investigationStageLabels[stage]}</h3>
                <span className="rounded-full bg-card px-2 py-0.5 text-xs text-text-muted">{laneItems.length}</span>
              </div>
              {laneItems.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {laneItems.map((item) => <WorkflowCard key={workflowKey(item)} item={item} onSave={onSave} isSaving={isSaving} />)}
                </div>
              ) : <p className="py-2 pl-10 text-xs text-text-muted">No investigations in this phase.</p>}
            </section>
          )
        })}
      </div>
    </section>
  )
}

export function EditorialCalendarPage() {
  const [panel, setPanel] = useState<DashboardPanel>('calendar')
  const { items, isLoading, isError, updateWorkflow, isSaving, updateError } = useEditorialCalendar()

  if (isLoading) return <PageLoader label="Loading editorial workflows..." />
  if (isError) {
    return <p role="alert" className="text-sm text-disputed">Couldn&apos;t load editorial workflows. Please refresh and try again.</p>
  }

  const tabs: { id: DashboardPanel; label: string }[] = [
    { id: 'calendar', label: 'Calendar' },
    { id: 'board', label: 'Editorial board' },
    { id: 'investigations', label: 'Investigation timeline' },
  ]

  return (
    <div>
      <div className="mb-5">
        <div className="mb-2 flex items-center gap-2 text-accent">
          <CalendarDays aria-hidden="true" className="size-5" />
          <span className="text-xs font-semibold uppercase tracking-wide">Editorial workflow</span>
        </div>
        <h1 className="text-2xl font-semibold text-heading">Editorial Calendar</h1>
        <p className="mt-1 max-w-3xl text-sm text-text-muted">
          Plan article deadlines, review editorial stages, and follow investigations from research through publication.
        </p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2 border-b border-border pb-3" role="tablist" aria-label="Editorial views">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={panel === id}
            onClick={() => setPanel(id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              panel === id ? 'bg-brand-gradient text-on-brand' : 'text-text-muted hover:bg-card hover:text-heading'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {updateError && (
        <p role="alert" className="mb-4 text-sm text-disputed">Couldn&apos;t save that workflow update. Please try again.</p>
      )}
      {panel === 'calendar' && <CalendarPanel items={items} onSave={updateWorkflow} isSaving={isSaving} />}
      {panel === 'board' && <EditorialBoard items={items} onSave={updateWorkflow} isSaving={isSaving} />}
      {panel === 'investigations' && <InvestigationTimeline items={items} onSave={updateWorkflow} isSaving={isSaving} />}
    </div>
  )
}
