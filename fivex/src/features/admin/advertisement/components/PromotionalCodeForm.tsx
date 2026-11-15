import { useState, type ReactNode } from 'react'
import { Save, Wand2, X } from 'lucide-react'
import {
  ELIGIBLE_USER_LABELS,
  METHOD_LABELS,
  REWARD_TYPE_LABELS,
  STATUS_LABELS,
  generateCode,
  type CodeMethod,
  type DurationUnit,
  type EligibleUsers,
  type PromotionStatus,
  type PromotionalCode,
  type PromotionalCodeDraft,
  type PromotionalCodeErrors,
  type RewardType,
} from '../utils/promotionalCodes'

const inputClass =
  'rounded-lg border border-card-border bg-card-2 px-3 py-2 text-sm text-card-heading placeholder:text-card-text-dim outline-none focus:border-accent w-full'

const MAX_GENERATION_ATTEMPTS = 20

interface PromotionalCodeFormProps {
  draft: PromotionalCodeDraft
  errors: PromotionalCodeErrors
  existingCodes: readonly PromotionalCode[]
  isEditing: boolean
  isSaving?: boolean
  onChange: <K extends keyof PromotionalCodeDraft>(field: K, value: PromotionalCodeDraft[K]) => void
  onSubmit: () => void
  onCancel: () => void
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-card-text-muted">{label}</span>
      {children}
      {error && <span className="text-xs text-disputed">{error}</span>}
    </label>
  )
}

export function PromotionalCodeForm({
  draft,
  errors,
  existingCodes,
  isEditing,
  isSaving = false,
  onChange,
  onSubmit,
  onCancel,
}: PromotionalCodeFormProps) {
  const [generateLength, setGenerateLength] = useState(8)
  const [generatePrefix, setGeneratePrefix] = useState('')
  const [generateError, setGenerateError] = useState('')

  const handleGenerate = () => {
    const taken = new Set(existingCodes.map((item) => item.code))
    for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
      const candidate = generateCode(draft.method, generateLength, generatePrefix)
      if (!taken.has(candidate)) {
        onChange('code', candidate)
        setGenerateError('')
        return
      }
    }
    setGenerateError('Could not find an unused code. Try a longer length.')
  }

  const handleMethodChange = (method: CodeMethod) => {
    onChange('method', method)
    setGenerateError('')
  }

  return (
    <form
      className="rounded-2xl border border-card-border bg-card p-5 mb-6"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
      noValidate
    >
      <h2 className="text-sm font-semibold text-card-heading mb-4">
        {isEditing ? 'Edit promotional code' : 'New promotional code'}
      </h2>

      <fieldset className="grid gap-4 md:grid-cols-2 mb-6">
        <legend className="text-xs font-semibold uppercase tracking-wide text-card-text-muted mb-2">Code</legend>

        <Field label="Generation method">
          <select
            className={inputClass}
            value={draft.method}
            onChange={(event) => handleMethodChange(event.target.value as CodeMethod)}
          >
            {(Object.keys(METHOD_LABELS) as CodeMethod[]).map((method) => (
              <option key={method} value={method}>
                {METHOD_LABELS[method]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Code" error={errors.code}>
          <input
            className={`${inputClass} font-mono uppercase`}
            value={draft.code}
            onChange={(event) => onChange('code', event.target.value.toUpperCase())}
            placeholder="e.g. IIT2026"
          />
        </Field>

        <div className="flex flex-wrap items-end gap-2 md:col-span-2">
          <Field label="Prefix (optional)">
            <input
              className={`${inputClass} w-40`}
              value={generatePrefix}
              onChange={(event) => setGeneratePrefix(event.target.value)}
              placeholder="e.g. IIT"
            />
          </Field>
          <Field label="Length">
            <input
              type="number"
              min={4}
              max={32}
              className={`${inputClass} w-24`}
              value={generateLength}
              onChange={(event) => setGenerateLength(Math.min(32, Math.max(4, Number(event.target.value) || 4)))}
            />
          </Field>
          <button
            type="button"
            onClick={handleGenerate}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-card-border text-card-heading hover:bg-card-2 transition-colors"
          >
            <Wand2 className="w-4 h-4" />
            Generate code
          </button>
          {generateError && <span className="text-xs text-disputed self-center">{generateError}</span>}
        </div>
      </fieldset>

      <fieldset className="grid gap-4 md:grid-cols-2 mb-6">
        <legend className="text-xs font-semibold uppercase tracking-wide text-card-text-muted mb-2">Promotion</legend>

        <Field label="Promotion name" error={errors.promotionName}>
          <input
            className={inputClass}
            value={draft.promotionName}
            onChange={(event) => onChange('promotionName', event.target.value)}
            placeholder="Internal campaign name"
          />
        </Field>

        <Field label="Status">
          <select
            className={inputClass}
            value={draft.status}
            onChange={(event) => onChange('status', event.target.value as PromotionStatus)}
          >
            {(Object.keys(STATUS_LABELS) as PromotionStatus[]).map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </Field>

        <div className="md:col-span-2">
          <Field label="Description">
            <textarea
              className={`${inputClass} resize-y`}
              rows={2}
              value={draft.description}
              onChange={(event) => onChange('description', event.target.value)}
              placeholder="What the promotion offers"
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className="grid gap-4 md:grid-cols-2 mb-6">
        <legend className="text-xs font-semibold uppercase tracking-wide text-card-text-muted mb-2">Reward</legend>

        <Field label="Reward type">
          <select
            className={inputClass}
            value={draft.rewardType}
            onChange={(event) => onChange('rewardType', event.target.value as RewardType)}
          >
            {(Object.keys(REWARD_TYPE_LABELS) as RewardType[]).map((type) => (
              <option key={type} value={type}>
                {REWARD_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Subscription plan" error={errors.subscriptionPlan}>
          <input
            className={inputClass}
            list="promo-subscription-plans"
            value={draft.subscriptionPlan}
            onChange={(event) => onChange('subscriptionPlan', event.target.value)}
          />
          <datalist id="promo-subscription-plans">
            <option value="Premium" />
          </datalist>
        </Field>

        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Field label="Reward duration" error={errors.rewardDurationValue}>
            <input
              type="number"
              min={1}
              className={inputClass}
              value={draft.rewardDurationValue}
              onChange={(event) => onChange('rewardDurationValue', event.target.value)}
            />
          </Field>
          <Field label="Unit">
            <select
              className={inputClass}
              value={draft.rewardDurationUnit}
              onChange={(event) => onChange('rewardDurationUnit', event.target.value as DurationUnit)}
            >
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
              <option value="months">Months</option>
            </select>
          </Field>
        </div>
      </fieldset>

      <fieldset className="grid gap-4 md:grid-cols-2 mb-6">
        <legend className="text-xs font-semibold uppercase tracking-wide text-card-text-muted mb-2">Validity and limits</legend>

        <Field label="Start date" error={errors.startDate}>
          <input
            type="date"
            className={inputClass}
            value={draft.startDate}
            onChange={(event) => onChange('startDate', event.target.value)}
          />
        </Field>

        <Field label="Expiration date" error={errors.expirationDate}>
          <input
            type="date"
            className={inputClass}
            value={draft.expirationDate}
            onChange={(event) => onChange('expirationDate', event.target.value)}
          />
        </Field>

        <Field label="Total redemption limit" error={errors.totalRedemptionLimit}>
          <input
            type="number"
            min={1}
            className={inputClass}
            value={draft.totalRedemptionLimit}
            onChange={(event) => onChange('totalRedemptionLimit', event.target.value)}
            placeholder="Maximum uses across all users"
          />
        </Field>

        <Field label="Per-user limit" error={errors.perUserLimit}>
          <input
            type="number"
            min={1}
            className={inputClass}
            value={draft.perUserLimit}
            onChange={(event) => onChange('perUserLimit', event.target.value)}
          />
        </Field>

        <Field label="Eligible users">
          <select
            className={inputClass}
            value={draft.eligibleUsers}
            onChange={(event) => onChange('eligibleUsers', event.target.value as EligibleUsers)}
          >
            {(Object.keys(ELIGIBLE_USER_LABELS) as EligibleUsers[]).map((option) => (
              <option key={option} value={option}>
                {ELIGIBLE_USER_LABELS[option]}
              </option>
            ))}
          </select>
        </Field>
      </fieldset>

      <fieldset className="grid gap-4 md:grid-cols-2 mb-6">
        <legend className="text-xs font-semibold uppercase tracking-wide text-card-text-muted mb-2">Attribution</legend>

        <Field label="Campaign">
          <input
            className={inputClass}
            value={draft.campaign}
            onChange={(event) => onChange('campaign', event.target.value)}
            placeholder="Associated marketing campaign"
          />
        </Field>

        <Field label="Partner">
          <input
            className={inputClass}
            value={draft.partner}
            onChange={(event) => onChange('partner', event.target.value)}
            placeholder="Influencer, marketer, organization, or referral source"
          />
        </Field>
      </fieldset>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-brand-gradient text-on-brand transition-colors disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {isEditing ? 'Save changes' : 'Add code'}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-card-border text-card-heading hover:bg-card-2 transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
