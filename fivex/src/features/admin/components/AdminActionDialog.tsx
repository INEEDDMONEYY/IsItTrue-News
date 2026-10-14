import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { getErrorMessage } from '@/lib/getErrorMessage'

interface AdminActionDialogProps {
  title: string
  description: string
  confirmLabel: string
  tone?: 'default' | 'danger'
  // Extra fields for actions that need more than a note (a person to pick, a conclusion to edit).
  children?: ReactNode
  // False while the extra fields in `children` aren't valid yet.
  canConfirm?: boolean
  wide?: boolean
  // When set, the admin writes a note, which is recorded in the history.
  note?: { label: string; required: boolean; maxLength: number; placeholder?: string }
  isPending: boolean
  error?: unknown
  onConfirm: (note: string) => void
  onCancel: () => void
}

const FOCUSABLE = 'button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [href]'

// A confirmation for actions that notify people or can't be undone. It keeps focus inside, closes on Escape
// (unless a request is in flight, so a slow save can't be dismissed and then repeated), and hands focus back.
export function AdminActionDialog({
  title,
  description,
  confirmLabel,
  tone = 'default',
  children,
  canConfirm = true,
  wide = false,
  note,
  isPending,
  error,
  onConfirm,
  onCancel,
}: AdminActionDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)
  const [text, setText] = useState('')

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    // The first thing to fill in, or the confirm button when there is nothing to fill in.
    const firstField = dialogRef.current?.querySelector<HTMLElement>('input:not([disabled]), select:not([disabled]), textarea:not([disabled])')
    ;(firstField ?? confirmRef.current)?.focus()
    return () => opener?.focus()
  }, [])

  const trimmed = text.trim()
  const missingNote = Boolean(note?.required) && !trimmed

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && !isPending) {
      event.stopPropagation()
      onCancel()
      return
    }
    if (event.key !== 'Tab') return
    const items = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
    if (items.length === 0) return
    const first = items[0]
    const last = items[items.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={() => !isPending && onCancel()}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-action-title"
        aria-describedby="admin-action-description"
        onClick={(event) => event.stopPropagation()}
        className={`w-full ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto rounded-2xl border border-card-border bg-card p-6 shadow-xl`}
      >
        <h2 id="admin-action-title" className="text-lg font-semibold text-card-heading">
          {title}
        </h2>
        <p id="admin-action-description" className="mt-2 text-sm leading-6 text-card-text-muted">
          {description}
        </p>

        {children && <div className="mt-4 flex flex-col gap-4">{children}</div>}

        {note && (
          <div className="mt-4">
            <label htmlFor="admin-action-note" className="block text-xs font-medium text-card-text-muted mb-1.5">
              {note.label}
              {note.required ? <span className="text-disputed"> (required)</span> : ' (optional)'}
            </label>
            <textarea
              id="admin-action-note"
              value={text}
              onChange={(event) => setText(event.target.value)}
              maxLength={note.maxLength}
              rows={4}
              placeholder={note.placeholder}
              disabled={isPending}
              className="w-full resize-none rounded-xl border border-card-border bg-bg px-3.5 py-2.5 text-sm text-heading placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent-border disabled:opacity-60"
            />
            <p className="mt-1 text-right text-xs text-text-dim">
              {text.length}/{note.maxLength}
            </p>
          </div>
        )}

        {error != null && (
          <p role="alert" className="mt-3 text-sm text-disputed">
            {getErrorMessage(error, 'That did not work. Please try again.')}
          </p>
        )}

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="rounded-lg border border-card-border px-4 py-2.5 text-sm font-semibold text-card-text transition hover:border-accent-border disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={() => onConfirm(trimmed)}
            disabled={isPending || missingNote || !canConfirm}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
              tone === 'danger' ? 'bg-disputed text-white' : 'bg-brand-gradient text-on-brand'
            }`}
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
