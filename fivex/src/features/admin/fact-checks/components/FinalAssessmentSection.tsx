import { Pencil } from 'lucide-react'
import dayjs from '@/lib/dayjs'
import { useFactCheckHistory } from '../hooks/useAdminFactChecks'
import type { ActionDialog, ConcludingAssessment, FactCheckRecord } from '../types/factCheck.types'
import { ASSESSMENT_MEANINGS } from '../utils/factCheckLabels'
import { AssessmentBadge } from './FactCheckStatusBadge'
import { PreviousAssessmentView } from './ReviewHistorySection'
import { Field, NotRecorded, RecordSection } from './RecordSection'

const UNCERTAIN: ConcludingAssessment[] = ['unverified', 'unable_to_verify']

// 4. The conclusion, why it was reached, what limits it and what is still unknown. A record with no conclusion
// says so plainly, rather than showing a placeholder verdict.
export function FinalAssessmentSection({ record, onOpen }: { record: FactCheckRecord; onOpen: (dialog: ActionDialog) => void }) {
  const { assessment, task } = record
  const { data: history } = useFactCheckHistory(record.id)

  // The most recent time a conclusion was replaced, and the one it replaced. Shown so a changed conclusion is
  // never mistaken for the original.
  const revision = history?.entries.find((entry) => entry.action === 'assessment_revised' && entry.previousAssessment)
  // When the record has no conclusion now, the last one it had (before it was returned or reopened).
  const withdrawn = !assessment
    ? history?.entries.find((entry) => entry.previousAssessment && entry.toAssessment === 'none')
    : undefined

  return (
    <RecordSection
      id="assessment"
      number={4}
      title="Final assessment"
      action={
        record.actions.reviseAssessment && (
          <button
            type="button"
            onClick={() => onOpen({ kind: 'revise' })}
            className="inline-flex items-center gap-1.5 rounded-lg border border-card-border px-3 py-1.5 text-xs font-medium text-card-heading hover:border-accent-border hover:text-accent transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
            Revise conclusion
          </button>
        )
      }
    >
      {assessment ? (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <AssessmentBadge status={assessment.status} />
            <span className="text-xs text-card-text-muted">
              {assessment.decidedBy ? `${assessment.decidedBy.name}` : 'A former user'}
              {assessment.decidedAt ? `, ${dayjs(assessment.decidedAt).format('MMM D, YYYY h:mm A')}` : ''}
            </span>
          </div>
          <p className="mt-2 text-sm text-card-text-muted">
            {ASSESSMENT_MEANINGS[assessment.status]}
          </p>

          <dl className="mt-3">
            <Field label="Conclusion">{assessment.conclusion ?? <NotRecorded />}</Field>
            <Field label="Reasoning">{assessment.reasoning ?? <NotRecorded />}</Field>
            <Field label="Limitations">{assessment.limitations ?? <NotRecorded />}</Field>
            <Field label="Remaining uncertainty">
              {assessment.uncertainty ?? (UNCERTAIN.includes(assessment.status) ? <NotRecorded /> : <span className="italic text-card-text-dim">None stated</span>)}
            </Field>
          </dl>

          {revision?.previousAssessment && (
            <div className="mt-3 rounded-xl border border-pending/30 bg-pending/10 p-3">
              <p className="text-sm font-medium text-card-heading">This conclusion was revised</p>
              <p className="mt-1 text-xs text-card-text-muted">
                {revision.actor.name} changed it on {dayjs(revision.createdAt).format('MMM D, YYYY')}
                {revision.note ? `. Reason: ${revision.note}` : '.'}
              </p>
              <PreviousAssessmentView previous={revision.previousAssessment} label="Original" />
            </div>
          )}
        </>
      ) : (
        <>
          <p className="text-sm text-card-text">
            {task.workflowStatus === 'returned'
              ? 'This record was returned for further review, so it has no conclusion right now.'
              : task.workflowStatus === 'escalated'
                ? 'This record is on hold while an escalation is resolved, so it has no conclusion right now.'
                : 'No conclusion has been recorded yet.'}
          </p>
          {task.returnReason && <p className="mt-2 text-sm text-card-text-muted">Reason it was returned: {task.returnReason}</p>}
          <p className="mt-2 text-xs text-card-text-dim">
            A routine admin action can&apos;t conclude an open record; that is the reviewer&apos;s call.
            {withdrawn?.previousAssessment ? ' The earlier conclusion is kept below.' : ''}
          </p>
          {withdrawn?.previousAssessment && <PreviousAssessmentView previous={withdrawn.previousAssessment} label="Earlier conclusion" />}
        </>
      )}
    </RecordSection>
  )
}
