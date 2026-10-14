import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Trash2, Undo2 } from 'lucide-react'
import type { AdminArticleDetail, AdminArticleStatus } from '../types/adminArticle.types'
import { useChangeArticleStatus, useDeleteAdminArticle } from '../hooks/useAdminArticles'
import { STATUS_LABELS } from '../utils/articleLabels'
import { AdminActionDialog } from '../../components/AdminActionDialog'
import { ArticleStatusBadge } from './ArticleStatusBadge'

const NOTE_MAX = 500

interface Move {
  label: string
  title: string
  description: string
  confirmLabel: string
  // Moves that take something away from the author or readers are styled as warnings.
  backward: boolean
  note: { label: string; required: boolean; maxLength: number; placeholder?: string }
}

function describeMove(from: AdminArticleStatus, to: AdminArticleStatus): Move {
  if (from === 'draft' && to === 'pending_review') {
    return {
      label: 'Move to review queue',
      title: 'Move this article to the review queue?',
      description: 'It joins the editors’ queue and every editor is notified that it needs a decision.',
      confirmLabel: 'Move to review',
      backward: false,
      note: { label: 'Note for the history', required: false, maxLength: NOTE_MAX },
    }
  }
  if (from === 'draft' && to === 'published') {
    return {
      label: 'Publish now',
      title: 'Publish this article now?',
      description: 'It goes live straight away, without an editor’s review.',
      confirmLabel: 'Publish',
      backward: false,
      note: { label: 'Note for the history', required: false, maxLength: NOTE_MAX },
    }
  }
  if (from === 'pending_review' && to === 'published') {
    return {
      label: 'Approve & publish',
      title: 'Approve and publish this article?',
      description: 'It goes live and the author is told it was approved.',
      confirmLabel: 'Approve & publish',
      backward: false,
      note: { label: 'Note for the history', required: false, maxLength: NOTE_MAX },
    }
  }
  if (from === 'pending_review' && to === 'draft') {
    return {
      label: 'Send back to author',
      title: 'Send this article back to the author?',
      description: 'It returns to their drafts and they are notified. They will see your note, so say what needs to change.',
      confirmLabel: 'Send back',
      backward: true,
      note: { label: 'What should the author change?', required: true, maxLength: NOTE_MAX },
    }
  }
  return {
    label: 'Unpublish',
    title: 'Unpublish this article?',
    description: 'It is taken offline straight away and returns to the author’s drafts. They are notified and shown your reason.',
    confirmLabel: 'Unpublish',
    backward: true,
    note: { label: 'Reason (shown to the author)', required: true, maxLength: NOTE_MAX },
  }
}

export function ArticleActions({ article }: { article: AdminArticleDetail }) {
  const navigate = useNavigate()
  const changeStatus = useChangeArticleStatus(article.id)
  const deleteArticle = useDeleteAdminArticle(article.id)
  const [target, setTarget] = useState<AdminArticleStatus | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [done, setDone] = useState<string | null>(null)

  const move = target ? describeMove(article.status, target) : null

  const open = (status: AdminArticleStatus) => {
    changeStatus.reset()
    setDone(null)
    setTarget(status)
  }

  const confirmMove = (note: string) => {
    if (!target) return
    changeStatus.mutate(
      { status: target, ...(note ? { note } : {}) },
      {
        onSuccess: () => {
          setDone(`Status changed to ${STATUS_LABELS[target]}.`)
          setTarget(null)
        },
      },
    )
  }

  const confirmDelete = () =>
    deleteArticle.mutate(undefined, { onSuccess: () => navigate('/admin/articles', { replace: true }) })

  return (
    <section aria-label="Status controls" className="flex flex-col gap-4 rounded-2xl border border-card-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-card-heading">Status</h2>
        <ArticleStatusBadge status={article.status} />
      </div>

      {article.allowedStatuses.length > 0 && (
        <ul className="flex flex-col gap-2">
          {article.allowedStatuses.map((status) => {
            const option = describeMove(article.status, status)
            const Icon = option.backward ? Undo2 : status === 'published' ? CheckCircle2 : ArrowRight
            return (
              <li key={status}>
                <button
                  type="button"
                  onClick={() => open(status)}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                    option.backward
                      ? 'border border-card-border text-card-heading hover:border-disputed hover:text-disputed'
                      : 'bg-brand-gradient text-on-brand'
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {option.label}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {done && (
        <p role="status" className="text-sm text-verified">
          {done}
        </p>
      )}

      <div className="border-t border-card-border pt-4">
        <button
          type="button"
          onClick={() => {
            deleteArticle.reset()
            setConfirmingDelete(true)
          }}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm text-disputed hover:bg-disputed/10 transition-colors"
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
          Delete article
        </button>
      </div>

      {move && (
        <AdminActionDialog
          title={move.title}
          description={move.description}
          confirmLabel={move.confirmLabel}
          tone={move.backward ? 'danger' : 'default'}
          note={move.note}
          isPending={changeStatus.isPending}
          error={changeStatus.error}
          onConfirm={confirmMove}
          onCancel={() => setTarget(null)}
        />
      )}

      {confirmingDelete && (
        <AdminActionDialog
          title="Delete this article?"
          description="It is removed permanently and can’t be restored. Its history stays in the audit log."
          confirmLabel="Delete article"
          tone="danger"
          isPending={deleteArticle.isPending}
          error={deleteArticle.error}
          onConfirm={confirmDelete}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}
    </section>
  )
}
