import { Link } from 'react-router-dom'
import dayjs from '@/lib/dayjs'
import type { FactCheckRecord } from '../types/factCheck.types'
import { Field, NotRecorded, RecordSection } from './RecordSection'

// 1. The claim itself: exactly what is being checked, its context, where it appeared and why it is being checked.
export function ClaimDetailsSection({ record }: { record: FactCheckRecord }) {
  const { claim, connections } = record
  return (
    <RecordSection id="claim" number={1} title="Claim details">
      <blockquote className="border-l-2 border-accent-border pl-4 text-base font-medium text-card-heading break-words">
        {claim.text}
      </blockquote>
      <dl className="mt-3">
        <Field label="Context">{claim.context ?? <NotRecorded />}</Field>
        <Field label="Why it is being checked">{claim.checkReason ?? <NotRecorded />}</Field>
        <Field label="Where it appeared">
          {connections.article ? (
            <Link to={`/admin/articles/${connections.article.id}`} className="text-accent hover:underline">
              {connections.article.title}
            </Link>
          ) : (
            <span className="italic text-card-text-dim">The article has been removed</span>
          )}
        </Field>
        <Field label="Added">
          {claim.createdBy ? `${claim.createdBy.name}, ` : ''}
          {dayjs(record.createdAt).format('MMM D, YYYY h:mm A')}
        </Field>
      </dl>
    </RecordSection>
  )
}
