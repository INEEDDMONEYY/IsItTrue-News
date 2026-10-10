import { useEffect, useRef } from 'react'

interface SubmitConfirmDialogProps {
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}

// Asks the author to confirm before sending the article off, since an editor is notified as soon as it is.
export function SubmitConfirmDialog({ title, description, confirmLabel, onConfirm, onCancel }: SubmitConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    confirmRef.current?.focus()
    return () => opener?.focus()
  }, [])

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onCancel()
      return
    }
    // Keeps Tab inside the dialog.
    if (event.key === 'Tab') {
      const first = cancelRef.current
      const last = confirmRef.current
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onCancel}
      onKeyDown={handleKeyDown}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="submit-confirm-title"
        aria-describedby="submit-confirm-description"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-card-border bg-card p-6 shadow-xl"
      >
        <h2 id="submit-confirm-title" className="text-lg font-semibold text-card-heading">
          {title}
        </h2>
        <p id="submit-confirm-description" className="mt-2 text-sm leading-6 text-card-text-muted">
          {description}
        </p>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-card-border px-4 py-2.5 text-sm font-semibold text-card-text transition hover:border-accent-border"
          >
            Keep editing
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-on-brand transition"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
