
import {
  CheckCircle2,
  FileEdit,
  FileText,
  SearchCheck,
} from 'lucide-react'

import type { AuthorArticle } from '../types/authorArticle.types'

interface DraftStatsProps {
  drafts: AuthorArticle[]
}

export function DraftStats({ drafts }: DraftStatsProps) {
  const total = drafts.length

  const inProgress = drafts.filter(
    (draft) =>
      draft.status === 'draft' ||
      draft.status === 'in-progress',
  ).length

  const factChecking = drafts.filter(
    (draft) =>
      draft.status === 'fact-check-needed' ||
      draft.status === 'fact-checking',
  ).length

  const readyToSubmit = drafts.filter(
    (draft) => draft.status === 'ready-to-submit',
  ).length

  const stats = [
    {
      label: 'Total Drafts',
      value: total,
      icon: FileText,
    },
    {
      label: 'In Progress',
      value: inProgress,
      icon: FileEdit,
    },
    {
      label: 'Fact Checking',
      value: factChecking,
      icon: SearchCheck,
    },
    {
      label: 'Ready to Submit',
      value: readyToSubmit,
      icon: CheckCircle2,
    },
  ]

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon

        return (
          <div
            key={stat.label}
            className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-card-text-muted)]">
                  {stat.label}
                </p>

                <p className="mt-2 text-2xl font-bold text-[var(--color-card-heading)]">
                  {stat.value}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        )
      })}
    </section>
  )
}

