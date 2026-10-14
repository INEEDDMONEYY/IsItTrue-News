import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageLoader } from '@/components/loaders/PageLoader'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { ClaimDetailsSection } from '../components/ClaimDetailsSection'
import { EvidenceSourcesSection } from '../components/EvidenceSourcesSection'
import { FactCheckActions, TaskPanel } from '../components/FactCheckActions'
import { FactCheckDialogs } from '../components/FactCheckDialogs'
import { FinalAssessmentSection } from '../components/FinalAssessmentSection'
import { PublicConnectionSection } from '../components/PublicConnectionSection'
import { ReviewHistorySection } from '../components/ReviewHistorySection'
import { useFactCheckHistory, useFactCheckRecord } from '../hooks/useAdminFactChecks'
import type { ActionDialog } from '../types/factCheck.types'

function BackLink() {
  return (
    <Link to="/admin/fact-checks" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors">
      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
      All fact-checks
    </Link>
  )
}

export function FactCheckDetailsPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { data: record, isLoading, error } = useFactCheckRecord(id)
  const history = useFactCheckHistory(id)
  const [dialog, setDialog] = useState<ActionDialog | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  if (isLoading) return <PageLoader label="Loading fact-check record..." />

  if (error || !record) {
    return (
      <div className="flex flex-col gap-3">
        <BackLink />
        <h1 className="text-2xl font-semibold text-heading">Fact-check record not found</h1>
        <p role="alert" className="text-sm text-text-muted">
          {getErrorMessage(error, 'This record may have been deleted.')}
        </p>
        {/* A deleted record's history is kept, so it stays reachable here. */}
        {history.data && history.data.entries.length > 0 && <ReviewHistorySection id={id} />}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <BackLink />

      <header className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-wide text-text-dim">Fact-check record</p>
        <h1 className="text-2xl font-semibold leading-snug break-words">{record.claim.text}</h1>
        <p className="text-xs text-text-dim">Record id {record.id}</p>
      </header>

      {/* On a phone the controls come first; from xl they sit in the right-hand column beside the record. */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:grid-rows-[auto_1fr] xl:items-start">
        <div className="min-w-0 xl:col-start-2 xl:row-start-1 flex flex-col gap-4">
          <TaskPanel record={record} />
          <FactCheckActions record={record} onOpen={setDialog} message={message} />
        </div>

        <div className="flex flex-col gap-6 min-w-0 xl:col-start-1 xl:row-start-1 xl:row-span-2">
          <ClaimDetailsSection record={record} />
          <EvidenceSourcesSection record={record} onOpen={setDialog} />
          <ReviewHistorySection id={record.id} onOpen={setDialog} />
          <FinalAssessmentSection record={record} onOpen={setDialog} />
          <PublicConnectionSection record={record} onOpen={setDialog} />
        </div>
      </div>

      <FactCheckDialogs
        record={record}
        dialog={dialog}
        onClose={() => setDialog(null)}
        onDone={setMessage}
      />
    </div>
  )
}
