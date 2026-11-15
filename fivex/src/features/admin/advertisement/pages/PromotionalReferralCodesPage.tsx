import { useState } from 'react'
import { Pencil, Tag, Trash2 } from 'lucide-react'
import { EmptyStateCard } from '@/components/cards'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { PromotionalCodeForm } from '../components/PromotionalCodeForm'
import { usePromotionalCodes } from '../hooks/usePromotionalCodes'
import {
  ELIGIBLE_USER_LABELS,
  STATUS_LABELS,
  draftFromCode,
  emptyDraft,
  formatReward,
  getEffectiveStatus,
  validatePromotionalCode,
  type PromotionStatus,
  type PromotionalCode,
  type PromotionalCodeDraft,
  type PromotionalCodeErrors,
} from '../utils/promotionalCodes'

const STATUS_CLASSES: Record<PromotionStatus, string> = {
  draft: 'text-card-text-muted',
  active: 'text-verified',
  paused: 'text-card-text-dim',
  expired: 'text-disputed',
}

const BACKEND_GAPS = [
  'Redemption tracking (total and per-user usage counts)',
  'Subscription plan catalog, so plans are selected rather than typed',
  'Campaign and partner records that codes can link to',
]

export function PromotionalReferralCodesPage() {
  const { query, createCode, updateCode, deleteCode } = usePromotionalCodes()
  const codes: PromotionalCode[] = query.data ?? []
  const [draft, setDraft] = useState<PromotionalCodeDraft>(emptyDraft)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [errors, setErrors] = useState<PromotionalCodeErrors>({})
  const [actionError, setActionError] = useState<string | null>(null)

  // The date comparison uses the UTC calendar day, matching the stored date strings.
  const today = new Date().toISOString().slice(0, 10)
  const saving = createCode.isPending || updateCode.isPending

  const resetForm = () => {
    setDraft(emptyDraft())
    setEditingId(null)
    setErrors({})
  }

  const handleSubmit = () => {
    const result = validatePromotionalCode(draft, codes, editingId)
    setErrors(result.errors)
    if (!result.value) return

    setActionError(null)
    const onError = (err: unknown) => setActionError(getErrorMessage(err, 'Could not save this code.'))
    if (editingId) {
      updateCode.mutate({ id: editingId, input: result.value }, { onSuccess: resetForm, onError })
    } else {
      createCode.mutate(result.value, { onSuccess: resetForm, onError })
    }
  }

  const handleEdit = (code: PromotionalCode) => {
    setDraft(draftFromCode(code))
    setEditingId(code.id)
    setErrors({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (id: string) => {
    setActionError(null)
    deleteCode.mutate(id, {
      onSuccess: () => {
        if (editingId === id) resetForm()
      },
      onError: (err) => setActionError(getErrorMessage(err, 'Could not delete this code.')),
    })
  }

  const handleChange = <K extends keyof PromotionalCodeDraft>(field: K, value: PromotionalCodeDraft[K]) => {
    setDraft((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-heading mb-1">Promotional Referral Codes</h1>
      <p className="text-sm text-text-muted mb-6">
        Create redemption codes for subscription rewards, and link each code to a campaign and partner.
      </p>

      {actionError ? (
        <p role="alert" className="rounded-md border border-destructive/40 p-3 text-sm text-destructive mb-6">
          {actionError}
        </p>
      ) : null}

      <PromotionalCodeForm
        draft={draft}
        errors={errors}
        existingCodes={codes}
        isEditing={editingId !== null}
        isSaving={saving}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={resetForm}
      />

      {query.isLoading ? <p className="text-sm text-muted-foreground mb-8">Loading codes…</p> : null}
      {query.error ? (
        <p role="alert" className="rounded-md border border-destructive/40 p-3 text-sm text-destructive mb-8">
          {getErrorMessage(query.error, 'Could not load promotional codes.')}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 mb-8">
        {codes.map((code) => {
          const status = getEffectiveStatus(code, today)
          return (
            <div key={code.id} className="rounded-xl border border-card-border bg-card p-4">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-card-heading">{code.code}</span>
                  <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border border-card-border text-card-text-muted">
                    {code.method}
                  </span>
                  <span className={`text-xs ${STATUS_CLASSES[status]}`}>{STATUS_LABELS[status]}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    aria-label={`Edit ${code.code}`}
                    onClick={() => handleEdit(code)}
                    className="p-1.5 rounded-lg text-card-text-muted hover:text-card-heading hover:bg-card-2 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${code.code}`}
                    onClick={() => handleDelete(code.id)}
                    className="p-1.5 rounded-lg text-card-text-muted hover:text-disputed hover:bg-card-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm font-medium text-card-heading">{code.promotionName}</p>
              {code.description && <p className="text-sm text-card-text-muted mt-1">{code.description}</p>}
              <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 mt-3 text-xs">
                <div>
                  <dt className="text-card-text-dim">Reward</dt>
                  <dd className="text-card-heading">{formatReward(code)}</dd>
                </div>
                <div>
                  <dt className="text-card-text-dim">Valid</dt>
                  <dd className="text-card-heading">
                    {code.startDate} to {code.expirationDate}
                  </dd>
                </div>
                <div>
                  <dt className="text-card-text-dim">Limits</dt>
                  <dd className="text-card-heading">
                    {code.totalRedemptionLimit} total, {code.perUserLimit} per user
                  </dd>
                </div>
                <div>
                  <dt className="text-card-text-dim">Eligibility</dt>
                  <dd className="text-card-heading">{ELIGIBLE_USER_LABELS[code.eligibleUsers]}</dd>
                </div>
                <div>
                  <dt className="text-card-text-dim">Campaign</dt>
                  <dd className="text-card-heading">{code.campaign || '—'}</dd>
                </div>
                <div>
                  <dt className="text-card-text-dim">Partner</dt>
                  <dd className="text-card-heading">{code.partner || '—'}</dd>
                </div>
              </dl>
            </div>
          )
        })}

        {codes.length === 0 && (
          <EmptyStateCard
            icon={Tag}
            title="No promotional codes yet"
            description="Create a code above to offer a subscription reward to new or existing users."
          />
        )}
      </div>

      <div className="rounded-xl border border-card-border bg-card p-4">
        <h2 className="text-sm font-semibold text-card-heading mb-2">Backend support still needed</h2>
        <ul className="list-disc pl-5 text-sm text-card-text-muted space-y-1">
          {BACKEND_GAPS.map((gap) => (
            <li key={gap}>{gap}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
