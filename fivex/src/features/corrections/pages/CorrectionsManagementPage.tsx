import { useMemo, useState } from 'react'
import { PageLoader } from '@/components/loaders/PageLoader'
import { useAuth } from '@/app/providers/AuthProvider'
import { CorrectionCard } from '../components/CorrectionCard'
import { NewCorrectionForm } from '../components/NewCorrectionForm'
import { useCorrections } from '../hooks/useCorrections'
import type { Correction, CorrectionStatus } from '../types/correction.types'

const TABS: { status: CorrectionStatus; label: string; empty: string }[] = [
  { status: 'queued', label: 'Corrections queue', empty: 'No correction requests are waiting.' },
  { status: 'investigating', label: 'Correction investigation', empty: 'Nothing is under investigation right now.' },
  { status: 'published', label: 'Published corrections', empty: 'No corrections have been published yet.' },
  { status: 'dismissed', label: 'Dismissed', empty: 'No requests have been dismissed.' },
]

// Published corrections are grouped per article so they read as Correction 1, 2, 3...
function groupByArticle(corrections: Correction[]) {
  const groups = new Map<string, { title: string; slug: string; items: Correction[] }>()
  for (const correction of corrections) {
    const group = groups.get(correction.article) ?? {
      title: correction.articleTitle,
      slug: correction.articleSlug,
      items: [],
    }
    group.items.push(correction)
    groups.set(correction.article, group)
  }
  for (const group of groups.values()) {
    group.items.sort((a, b) => (a.publication?.number ?? 0) - (b.publication?.number ?? 0))
  }
  return [...groups.entries()]
}

export function CorrectionsManagementPage() {
  const { user } = useAuth()
  const canManage = user?.role === 'editor' || user?.role === 'admin'
  const [status, setStatus] = useState<CorrectionStatus>('queued')

  const {
    corrections,
    counts,
    isLoading,
    isError,
    startInvestigation,
    recordFindings,
    publish,
    dismiss,
    create,
    isCreating,
    createError,
  } = useCorrections(status)

  const published = useMemo(() => (status === 'published' ? groupByArticle(corrections) : []), [status, corrections])
  const activeTab = TABS.find((tab) => tab.status === status)!

  if (!canManage) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-heading mb-1">Corrections</h1>
        <p className="text-sm text-text-muted">
          Corrections are reviewed and published by the editorial team. Once a correction is published it appears on
          the article itself.
        </p>
      </div>
    )
  }

  const cardProps = {
    onStartInvestigation: startInvestigation,
    onRecordFindings: (id: string, findings: string, verdict: Parameters<typeof recordFindings>[0]['verdict']) =>
      recordFindings({ id, findings, verdict }),
    onPublish: (id: string, text: string) => publish({ id, text }),
    onDismiss: (id: string, reason: string) => dismiss({ id, reason }),
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-heading mb-1">Corrections Management</h1>
      <p className="text-sm text-text-muted mb-6">
        Review reported errors, investigate them, and publish corrections. Nothing is ever deleted — every request keeps
        its full history.
      </p>

      <div role="tablist" className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.status}
            type="button"
            role="tab"
            aria-selected={status === tab.status}
            onClick={() => setStatus(tab.status)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
              status === tab.status
                ? 'border-transparent bg-brand-gradient text-on-brand'
                : 'border-border text-text-muted hover:text-text hover:bg-surface-2'
            }`}
          >
            {tab.label}
            {counts && <span className="ml-1.5 text-xs opacity-80">{counts[tab.status]}</span>}
          </button>
        ))}
      </div>

      {status === 'queued' && (
        <div className="mb-6">
          <NewCorrectionForm isSaving={isCreating} error={createError} onSubmit={create} />
        </div>
      )}

      {isLoading ? (
        <PageLoader label="Loading corrections..." />
      ) : isError ? (
        <p className="text-sm text-disputed">Couldn&apos;t load corrections. Please refresh and try again.</p>
      ) : corrections.length === 0 ? (
        <div className="rounded-xl border border-card-border bg-card p-8 text-center text-sm text-card-text-muted">
          {activeTab.empty}
        </div>
      ) : status === 'published' ? (
        <div className="flex flex-col gap-6 max-w-3xl">
          {published.map(([articleId, group]) => (
            <section key={articleId} className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-heading break-words">
                {group.title}{' '}
                <span className="font-normal text-text-muted">
                  · {group.items.length} {group.items.length === 1 ? 'correction' : 'corrections'}
                </span>
              </h2>
              {group.items.map((correction) => (
                <CorrectionCard key={correction.id} correction={correction} {...cardProps} />
              ))}
            </section>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-w-3xl">
          {corrections.map((correction) => (
            <CorrectionCard key={correction.id} correction={correction} {...cardProps} />
          ))}
        </div>
      )}
    </div>
  )
}
