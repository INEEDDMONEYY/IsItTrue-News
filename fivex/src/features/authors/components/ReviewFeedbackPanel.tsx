import { CheckCircle2, Circle, MessageSquareWarning } from 'lucide-react'
import type { ArticleReviewInfo } from '@/shared/types/articleReview.types'

interface ReviewFeedbackPanelProps {
  review: ArticleReviewInfo
  // When provided, requirements render as checkboxes the author can tick off.
  onToggleRequirement?: (requirementId: string, done: boolean) => void
  disabled?: boolean
}

export function ReviewFeedbackPanel({ review, onToggleRequirement, disabled }: ReviewFeedbackPanelProps) {
  const requirements = review.reviewRequirements ?? []
  const doneCount = requirements.filter((requirement) => requirement.done).length
  const editorName = review.reviewedBy?.name

  return (
    <section className="rounded-xl border border-pending/30 bg-pending/10 p-4 flex flex-col gap-3">
      <div className="flex items-start gap-2.5">
        <MessageSquareWarning className="w-4 h-4 mt-0.5 shrink-0 text-pending" />
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-card-heading">Changes requested before this can be published</h3>
          <p className="text-xs text-card-text-muted">
            {editorName ? `From ${editorName}` : 'From your editor'}
            {review.reviewedAt ? ` · ${new Date(review.reviewedAt).toLocaleDateString()}` : ''}
          </p>
        </div>
      </div>

      {review.reviewNote && (
        <p className="whitespace-pre-line break-words rounded-lg bg-card px-3 py-2 text-sm text-card-text">
          {review.reviewNote}
        </p>
      )}

      {requirements.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-card-heading">
            Requirements ({doneCount} of {requirements.length} done)
          </p>
          <ul className="flex flex-col gap-1.5">
            {requirements.map((requirement) => {
              const Icon = requirement.done ? CheckCircle2 : Circle
              const content = (
                <>
                  <Icon
                    className={`w-4 h-4 mt-0.5 shrink-0 ${requirement.done ? 'text-verified' : 'text-card-text-muted'}`}
                  />
                  <span
                    className={`text-sm break-words ${
                      requirement.done ? 'text-card-text-muted line-through' : 'text-card-text'
                    }`}
                  >
                    {requirement.text}
                  </span>
                </>
              )

              return (
                <li key={requirement.id}>
                  {onToggleRequirement ? (
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onToggleRequirement(requirement.id, !requirement.done)}
                      aria-pressed={requirement.done}
                      className="flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-card transition-colors disabled:opacity-60"
                    >
                      {content}
                    </button>
                  ) : (
                    <div className="flex items-start gap-2 px-2 py-1.5">{content}</div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}
