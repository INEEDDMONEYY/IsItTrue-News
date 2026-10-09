import { useState } from 'react'
import { CalendarClock, FileText, Save } from 'lucide-react'
import type {
  ArticleEditorialStage,
  EditorialCalendarItem,
  EditorialWorkflowUpdate,
  InvestigationWorkflowStage,
} from '../types/calendar.types'
import { articleStageLabels, investigationStageLabels } from '../types/calendar.types'

interface WorkflowCardProps {
  item: EditorialCalendarItem
  onSave: (workflow: EditorialWorkflowUpdate) => Promise<void>
  isSaving: boolean
}

export function WorkflowCard({ item, onSave, isSaving }: WorkflowCardProps) {
  const stage = item.kind === 'article' ? item.editorialStage : item.workflowStage
  const [selectedStage, setSelectedStage] = useState(stage)
  const [deadline, setDeadline] = useState(item.editorialDeadline?.slice(0, 10) ?? '')

  const hasChanged = selectedStage !== stage || deadline !== (item.editorialDeadline?.slice(0, 10) ?? '')
  const label = item.kind === 'article'
    ? articleStageLabels[item.editorialStage]
    : investigationStageLabels[item.workflowStage]

  const save = async () => {
    if (item.kind === 'article') {
      await onSave({
        kind: 'article',
        id: item.id,
        stage: selectedStage as ArticleEditorialStage,
        deadline: deadline || null,
      })
      return
    }
    await onSave({
      kind: 'investigation',
      id: item.id,
      stage: selectedStage as InvestigationWorkflowStage,
      deadline: deadline || null,
    })
  }

  return (
    <article className="rounded-xl border border-card-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words text-sm font-semibold text-card-heading">{item.title}</h3>
          <p className="mt-1 text-xs text-card-text-muted">
            {item.kind === 'article' ? 'Article' : 'Investigation'}
            {item.author?.name ? ` · ${item.author.name}` : ''}
          </p>
        </div>
        {item.kind === 'article' ? (
          <FileText aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-text-muted" />
        ) : (
          <CalendarClock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-text-muted" />
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
        <label className="block text-xs font-medium text-text-muted">
          Workflow stage
          <select
            className="mt-1 block w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm text-heading"
            value={selectedStage}
            onChange={(event) => setSelectedStage(event.target.value as typeof selectedStage)}
          >
            {item.kind === 'article'
              ? Object.entries(articleStageLabels).map(([value, text]) => (
                  <option key={value} value={value}>{text}</option>
                ))
              : Object.entries(investigationStageLabels).map(([value, text]) => (
                  <option key={value} value={value}>{text}</option>
                ))}
          </select>
        </label>
        <label className="block text-xs font-medium text-text-muted">
          Editorial deadline
          <input
            className="mt-1 block w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm text-heading"
            type="date"
            value={deadline}
            onChange={(event) => setDeadline(event.target.value)}
          />
        </label>
        <button
          type="button"
          disabled={!hasChanged || isSaving}
          onClick={() => { void save().catch(() => undefined) }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-gradient px-3 py-2 text-sm font-medium text-on-brand disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save aria-hidden="true" className="size-4" />
          Save
        </button>
      </div>
      <p className="mt-2 text-xs text-card-text-muted">Current stage: {label}</p>
    </article>
  )
}
