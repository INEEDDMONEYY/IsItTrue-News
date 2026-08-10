import { MessageCircle, UserRound } from 'lucide-react'
import type { CommentView } from '../types/comment.types'

interface CommentViewToggleProps {
  value: CommentView
  onChange: (value: CommentView) => void
}

const options: {
  value: CommentView
  label: string
  description: string
  icon: typeof UserRound
}[] = [
  {
    value: 'my-comments',
    label: 'My Comments',
    description: 'Comments you have written',
    icon: UserRound,
  },
  {
    value: 'on-my-posts',
    label: 'On My Posts',
    description: 'Comments from readers',
    icon: MessageCircle,
  },
]

export function CommentViewToggle({
  value,
  onChange,
}: CommentViewToggleProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const Icon = option.icon
        const active = value === option.value

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={[
              'flex items-center gap-3 rounded-2xl border p-4 text-left transition-all',
              active
                ? 'border-blue-200 bg-blue-50 shadow-sm'
                : 'border-[var(--color-border)] bg-[var(--color-card)] hover:border-blue-200 hover:shadow-sm',
            ].join(' ')}
          >
            <span
              className={[
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                active
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-[var(--color-card-2)] text-[var(--color-text-muted)]',
              ].join(' ')}
            >
              <Icon className="h-5 w-5" />
            </span>

            <span className="min-w-0">
              <span
                className={[
                  'block text-sm font-semibold',
                  active
                    ? 'text-blue-700'
                    : 'text-[var(--color-card-heading)]',
                ].join(' ')}
              >
                {option.label}
              </span>

              <span className="mt-0.5 block text-xs text-[var(--color-card-text-muted)]">
                {option.description}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}