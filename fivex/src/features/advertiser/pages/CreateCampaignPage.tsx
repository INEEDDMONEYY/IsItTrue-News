import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, CheckCircle2, ImageIcon, Loader2, Send, Save, X } from 'lucide-react'
import { useAdvertiserAuth } from '@/app/providers/AdvertiserAuthProvider'
import { LoaderState } from '@/components/loaders/LoaderState'
import { PageLoader } from '@/components/loaders/PageLoader'
import dayjs from '@/lib/dayjs'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { AdPlacementPreview, type PreviewCreative } from '../components/AdPlacementPreview'
import { AdvertiserPageHeader } from '../components/AdvertiserPageHeader'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { AssetPicker } from '../components/AssetPicker'
import { CampaignStatusBadge } from '../components/CampaignStatusBadge'
import { useAdSlots } from '../hooks/useAdSlots'
import { useCampaign, useCreateBundle, usePricing, useUpdateCampaign } from '../hooks/useCampaigns'
import {
  CAMPAIGN_DURATIONS,
  type AdTargetPage,
  type AdvertiserCampaign,
  type BundleInput,
  type CampaignDuration,
  type CampaignEditInput,
  type CampaignPlacement,
  type CampaignStatus,
  type PricingCatalog,
  type SectionSlotId,
} from '../types/advertiser.types'
import { resolveAssetUrl } from '../utils/assetUrl'
import { formatMoney, toDateInput } from '../utils/format'
import { PLACEMENT_SPECS, PLACEMENT_SPEC_BY_ID, TARGET_PAGE_OPTIONS, type PlacementSpec } from '../utils/placements'

const EDITABLE: CampaignStatus[] = ['draft', 'pending_review', 'paused', 'rejected']
// Mirrors the server's NEWSLETTER_WINDOW_DAYS and MAX_NEWSLETTER_SENDS.
const NEWSLETTER_WINDOW_DAYS = 30
const MAX_NEWSLETTER_SENDS = 12
// Placements sold per page or category. Each page or category holds one ad per placement.
const PER_PAGE_PLACEMENTS: CampaignPlacement[] = ['selected_page', 'sidepage']

type PurchaseMode = 'single' | 'bundle'

interface ImageChoice {
  assetId: string
  url: string
}

interface FormState {
  mode: PurchaseMode
  bundleId: string | null
  name: string
  placement: CampaignPlacement
  durationDays: CampaignDuration
  sends: number
  headline: string
  body: string
  ctaLabel: string
  destinationUrl: string
  // A single placement uses `image`. A bundle keeps one image per placement, since each size needs its own.
  image: ImageChoice | null
  bundleImages: Partial<Record<CampaignPlacement, ImageChoice>>
  targetPages: AdTargetPage[]
  targetCategories: string[]
  sectionSlot: SectionSlotId | null
  startDate: string
}

// Each site page and each article category counts as one page of a Selected Page ad.
function pageCountFor(form: FormState): number {
  return form.targetPages.length + form.targetCategories.length
}

function initialState(campaign?: AdvertiserCampaign): FormState {
  return {
    // New purchases are always bundles. Existing single placements stay editable as single.
    mode: campaign ? 'single' : 'bundle',
    bundleId: null,
    name: campaign?.name ?? '',
    placement: campaign?.placement ?? 'header',
    durationDays: campaign?.durationDays ?? 30,
    sends: campaign?.sends ?? 1,
    headline: campaign?.creative?.headline ?? '',
    body: campaign?.creative?.body ?? '',
    ctaLabel: campaign?.creative?.ctaLabel ?? 'Learn more',
    destinationUrl: campaign?.creative?.destinationUrl ?? '',
    image: campaign?.creative?.imageAsset ? { assetId: campaign.creative.imageAsset, url: campaign.creative.imageUrl ?? '' } : null,
    bundleImages: {},
    targetPages: campaign?.targetPages ?? [],
    targetCategories: campaign?.targetCategories ?? [],
    sectionSlot: null,
    startDate: toDateInput(campaign?.startDate),
  }
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

interface Requirements {
  specs: PlacementSpec[]
  bodyRequired: boolean
  imageRequired: boolean
  targeted: boolean
}

// The image a placement uses: the single image in single mode, or that placement's own image in a bundle.
function imageChoiceFor(form: FormState, placement: CampaignPlacement): ImageChoice | null {
  return form.mode === 'bundle' ? (form.bundleImages[placement] ?? null) : form.image
}

// A bundle's creative text is shared, so it must satisfy every placement it includes.
function requirementsFor(form: FormState, catalog: PricingCatalog): Requirements {
  const specs =
    form.mode === 'bundle'
      ? (catalog.bundles.find((bundle) => bundle.id === form.bundleId)?.placements ?? []).map(
          (item) => PLACEMENT_SPEC_BY_ID[item.placement],
        )
      : [PLACEMENT_SPEC_BY_ID[form.placement]]
  return {
    specs,
    bodyRequired: specs.some((spec) => spec.bodyRequired),
    imageRequired: specs.some((spec) => spec.imageRequired),
    targeted: specs.some((spec) => spec.targeted),
  }
}

// Mirrors the server's submission checks so advertisers see every gap before they submit; the server re-checks.
// Editing a live-purchase campaign keeps its paid terms, so only the name and creative are checked.
function submissionProblems(form: FormState, requirements: Requirements, editing: boolean): string[] {
  const problems: string[] = []
  if (form.mode === 'bundle' && !form.bundleId) problems.push('Choose a campaign bundle.')
  if (!editing && form.mode === 'bundle' && requirements.specs.some((spec) => spec.id === 'section_ad') && !form.sectionSlot) {
    problems.push('Choose a Section Ad slot.')
  }
  if (!form.name.trim()) problems.push('Name your campaign.')
  if (!form.headline.trim()) problems.push('Add a headline.')
  if (requirements.bodyRequired && !form.body.trim()) problems.push('Add body text for this placement.')
  if (!form.ctaLabel.trim()) problems.push('Add a button label.')
  if (!isHttpUrl(form.destinationUrl.trim())) problems.push('Add a valid destination URL (starting with https://).')
  for (const spec of requirements.specs) {
    if (spec.imageRequired && !imageChoiceFor(form, spec.id)) {
      problems.push(requirements.specs.length > 1 ? `Choose an image for ${spec.label}.` : 'Choose an image for this placement.')
    }
  }
  if (requirements.targeted && pageCountFor(form) === 0) problems.push('Choose at least one page or category to show this ad on.')
  if (!editing && form.mode === 'single' && form.placement === 'newsletter' && (form.sends < 1 || form.sends > MAX_NEWSLETTER_SENDS)) {
    problems.push(`Choose between 1 and ${MAX_NEWSLETTER_SENDS} newsletter sends.`)
  }
  if (!editing && !form.startDate) problems.push('Choose a start date.')
  return problems
}

// Days the campaign runs from its start date. Single newsletters use a fixed window.
function runDaysFor(form: FormState): number {
  if (form.mode === 'single' && form.placement === 'newsletter') return NEWSLETTER_WINDOW_DAYS
  return form.durationDays
}

// Prices shown to the advertiser. The server recalculates everything on save.
function priceLinesFor(form: FormState, catalog: PricingCatalog): { label: string; cents: number }[] {
  const pageCount = pageCountFor(form)
  if (form.mode === 'bundle') {
    const bundle = catalog.bundles.find((item) => item.id === form.bundleId)
    if (!bundle) return []
    const lines = [{ label: `${bundle.name} (${form.durationDays} days)`, cents: bundle.prices[form.durationDays] }]
    // Mirrors the server: pages beyond the bundle's included pages are charged for each per-page placement it holds.
    const extraPages = Math.max(0, pageCount - bundle.categorySponsors)
    const perPageRate = bundle.placements
      .filter((item) => PER_PAGE_PLACEMENTS.includes(item.placement))
      .reduce(
        (sum, item) =>
          sum + (catalog.placements.find((rate) => rate.placement === item.placement)?.prices[form.durationDays] ?? 0),
        0,
      )
    if (extraPages > 0 && perPageRate > 0) {
      lines.push({
        label: `Extra pages (${extraPages} × ${formatMoney(perPageRate)} per page)`,
        cents: extraPages * perPageRate,
      })
    }
    return lines
  }

  const rate = catalog.placements.find((item) => item.placement === form.placement)
  if (!rate) return []
  const spec = PLACEMENT_SPEC_BY_ID[form.placement]
  if (form.placement === 'newsletter') {
    return [
      {
        label: `${spec.label} (${form.sends} ${form.sends === 1 ? 'send' : 'sends'})`,
        cents: rate.prices[form.durationDays] * form.sends,
      },
    ]
  }
  if (PER_PAGE_PLACEMENTS.includes(form.placement)) {
    return [
      {
        label: `${spec.label} (${pageCount} ${pageCount === 1 ? 'page' : 'pages'}, ${form.durationDays} days)`,
        cents: rate.prices[form.durationDays] * pageCount,
      },
    ]
  }
  return [{ label: `${spec.label} (${form.durationDays} days)`, cents: rate.prices[form.durationDays] }]
}

function creativeFields(form: FormState, imageAssetId: string | null) {
  return {
    headline: form.headline.trim(),
    body: form.body.trim(),
    ctaLabel: form.ctaLabel.trim(),
    destinationUrl: form.destinationUrl.trim(),
    imageAssetId,
  }
}

// Editing only changes the name and creative. The server ignores any paid terms sent with it.
function toEditInput(form: FormState, submit: boolean): CampaignEditInput {
  return {
    name: form.name.trim(),
    creative: creativeFields(form, form.image?.assetId ?? null),
    submit,
  }
}

function toBundleInput(form: FormState, submit: boolean): BundleInput {
  const images: BundleInput['images'] = {}
  for (const [placement, choice] of Object.entries(form.bundleImages)) {
    images[placement as CampaignPlacement] = choice?.assetId ?? null
  }
  return {
    bundleId: form.bundleId ?? '',
    name: form.name.trim(),
    durationDays: form.durationDays,
    creative: creativeFields(form, null),
    images,
    targetPages: form.targetPages,
    targetCategories: form.targetCategories,
    sectionSlot: form.sectionSlot,
    startDate: form.startDate || null,
    submit,
  }
}

const inputClass =
  'mt-1.5 w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm text-heading placeholder:text-text-dim focus:border-accent focus:outline-none'

function Field({ label, hint, children, counter }: { label: string; hint?: string; children: ReactNode; counter?: string }) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-2 text-sm font-medium text-heading">
        {label}
        {counter && <span className="text-xs font-normal text-text-dim">{counter}</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-text-muted">{hint}</span>}
    </label>
  )
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
      <h2 className="text-base font-semibold text-heading">{title}</h2>
      {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  )
}

function CampaignForm({ campaign, catalog }: { campaign?: AdvertiserCampaign; catalog: PricingCatalog }) {
  const navigate = useNavigate()
  const { advertiser } = useAdvertiserAuth()
  const updateCampaign = useUpdateCampaign(campaign?.id)
  const createBundle = useCreateBundle()
  const [form, setForm] = useState<FormState>(() => initialState(campaign))
  const [pickerPlacement, setPickerPlacement] = useState<CampaignPlacement | null>(null)
  const [showProblems, setShowProblems] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { categories, isLoading: categoriesLoading } = useCategories()
  const { data: slots } = useAdSlots()
  const headerSlot = slots?.find((slot) => slot.placement === 'header')
  const sectionSlots = slots?.find((slot) => slot.placement === 'section_ad')?.sections ?? []
  // The per-page placements in this purchase. A category is only open if every one of them is open there.
  const perPagePlacementsInPurchase = (
    form.mode === 'bundle'
      ? (catalog.bundles.find((item) => item.id === form.bundleId)?.placements ?? []).map((item) => item.placement)
      : [form.placement]
  ).filter((placement) => PER_PAGE_PLACEMENTS.includes(placement))
  // Null until slot availability loads, so nothing is disabled on a guess.
  const categoryOpen = (slug: string) => {
    const open = perPagePlacementsInPurchase.map((placement) => {
      const slot = slots?.find((item) => item.placement === placement)
      return slot ? Math.max(slot.capacity - (slot.categoryTaken[slug] ?? 0), 0) : null
    })
    return open.length === 0 || open.includes(null) ? null : Math.min(...(open as number[]))
  }
  const isCategorySoldOut = (slug: string) => categoryOpen(slug) === 0 && !form.targetCategories.includes(slug)

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((prev) => ({ ...prev, [key]: value }))
  // Editing keeps the paid terms from the original purchase; only the name and creative can change.
  const locked = Boolean(campaign)
  const requirements = useMemo(() => requirementsFor(form, catalog), [form, catalog])
  const problems = useMemo(() => submissionProblems(form, requirements, locked), [form, requirements, locked])
  const priceLines = useMemo(() => priceLinesFor(form, catalog), [form, catalog])
  const bundle = catalog.bundles.find((item) => item.id === form.bundleId)
  const isBundle = form.mode === 'bundle'
  const pending = updateCampaign.isPending || createBundle.isPending
  const brand = advertiser?.businessName ?? ''
  const today = dayjs().format('YYYY-MM-DD')
  const runDays = runDaysFor(form)
  const endLabel = form.startDate ? dayjs(form.startDate).add(runDays - 1, 'day').format('MMM D, YYYY') : null
  const pageRate = catalog.placements.find((item) => item.placement === 'selected_page')?.prices[form.durationDays] ?? 0
  const totalCents = priceLines.reduce((sum, line) => sum + line.cents, 0)
  const bundleSavingsCents = bundle ? bundle.individualValues[form.durationDays] - bundle.prices[form.durationDays] : 0
  const previewPlacements: CampaignPlacement[] = isBundle
    ? (bundle?.placements.map((item) => item.placement) ?? [])
    : [form.placement]
  const previewSpecs = previewPlacements.map((placement) => PLACEMENT_SPEC_BY_ID[placement])

  const creativeFor = (placement: CampaignPlacement): PreviewCreative => ({
    headline: form.headline,
    body: form.body,
    ctaLabel: form.ctaLabel,
    destinationUrl: form.destinationUrl,
    imageUrl: resolveAssetUrl(imageChoiceFor(form, placement)?.url || undefined),
  })

  // A bundle asks for one image per placement; a single placement asks for its one image.
  const imageSlots = isBundle ? previewSpecs : [PLACEMENT_SPEC_BY_ID[form.placement]]
  const setImage = (placement: CampaignPlacement, choice: ImageChoice | null) =>
    setForm((prev) =>
      prev.mode === 'bundle'
        ? { ...prev, bundleImages: { ...prev.bundleImages, [placement]: choice ?? undefined } }
        : { ...prev, image: choice },
    )

  const persist = (submit: boolean) => {
    setError(null)
    if (submit && problems.length > 0) {
      setShowProblems(true)
      return
    }
    if (!submit && !form.name.trim()) {
      setError('Name your campaign before saving a draft.')
      return
    }

    const onError = (err: unknown) => setError(getErrorMessage(err, 'Could not save the campaign.'))
    if (!campaign) {
      createBundle.mutate(toBundleInput(form, submit), {
        onSuccess: () => {
          const notice = submit
            ? `"${form.name.trim()}" bundle was submitted for review.`
            : `"${form.name.trim()}" bundle was saved as drafts.`
          navigate('/advertiser/campaigns', { state: { notice } })
        },
        onError,
      })
      return
    }

    updateCampaign.mutate(toEditInput(form, submit), {
      onSuccess: (saved) => {
        const notice =
          saved.status === 'active'
            ? `"${saved.name}" is approved and live.`
            : saved.status === 'pending_review'
              ? `"${saved.name}" was submitted for review.`
              : `"${saved.name}" was saved as a draft.`
        navigate('/advertiser/campaigns', { state: { notice } })
      },
      onError,
    })
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    persist(true)
  }

  const togglePage = (page: AdTargetPage) =>
    update('targetPages', form.targetPages.includes(page) ? form.targetPages.filter((p) => p !== page) : [...form.targetPages, page])

  const toggleCategory = (slug: string) =>
    update(
      'targetCategories',
      form.targetCategories.includes(slug) ? form.targetCategories.filter((s) => s !== slug) : [...form.targetCategories, slug],
    )

  const selectableCategorySlugs = categories.map((category) => category.slug).filter((slug) => !isCategorySoldOut(slug))
  const allCategoriesSelected =
    selectableCategorySlugs.length > 0 && selectableCategorySlugs.every((slug) => form.targetCategories.includes(slug))
  const toggleAllCategories = () => update('targetCategories', allCategoriesSelected ? [] : selectableCategorySlugs)

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <Section
        title="1. Choose what to run"
        description={
          isBundle
            ? `Bundles share one creative across every placement they include, and run for ${form.durationDays} days.`
            : 'Every option below previews your current ad. Fill in the details further down and the previews update as you type.'
        }
      >
        {campaign && (
          <p className="mb-5 rounded-xl bg-accent-bg px-4 py-3 text-sm text-text-muted">
            Placement, pages, duration, sends and dates are locked to your original payment. You can update the name and
            creative.
            {campaign.bundleId && ' This placement is part of a bundle, so changes here update only this placement.'}
          </p>
        )}

        {isBundle ? (
          <>
          <div role="radiogroup" aria-label="Campaign bundle" className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {catalog.bundles.map((option) => {
              const selected = option.id === form.bundleId
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => update('bundleId', option.id)}
                  className={`flex flex-col rounded-2xl border p-4 text-left transition ${
                    selected ? 'border-accent bg-accent-bg ring-2 ring-accent' : 'border-border bg-bg hover:border-accent-border'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-heading">{option.name}</p>
                      <p className="mt-0.5 text-xs text-text-muted">{option.tagline}</p>
                    </div>
                    {option.recommended ? (
                      <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-white">Recommended</span>
                    ) : selected ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                    ) : null}
                  </div>
                  <p className="mt-3 text-2xl font-bold text-heading">{formatMoney(option.prices[form.durationDays])}</p>
                  <p className="text-xs text-text-muted">
                    Individual value {formatMoney(option.individualValues[form.durationDays])} · Save{' '}
                    {formatMoney(option.individualValues[form.durationDays] - option.prices[form.durationDays])}
                  </p>
                  <ul className="mt-3 space-y-1 text-xs text-text-muted">
                    {option.placements.map((item) => (
                      <li key={item.placement}>
                        • {item.label} ({item.placement === 'newsletter' ? 'one distribution' : `${form.durationDays} days`})
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-text-dim">{option.description}</p>
                </button>
              )
            })}
          </div>
          {bundle && (
            <div className="mt-5 rounded-2xl border border-border bg-bg p-4">
              <p className="text-sm font-medium text-heading">What {bundle.name} includes</p>
              <p className="mt-0.5 text-xs text-text-muted">
                Included placements are locked to this bundle. Placements not in it are shown for reference.
              </p>
              <fieldset disabled className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                <legend className="sr-only">Placements in {bundle.name}</legend>
                {catalog.placements.map((item) => {
                  const included = bundle.placements.find((p) => p.placement === item.placement)
                  const isHeader = item.placement === 'header'
                  const headerOpen = headerSlot?.pages[0]?.open
                  let status = included ? 'Included' : 'Not included'
                  if (included && isHeader && headerSlot && headerOpen !== undefined) {
                    status =
                      headerOpen === 0
                        ? 'Included · header sold out'
                        : `Included · ${Math.max(headerOpen - 1, 0)} of ${headerSlot.capacity} header slots left after this`
                  }
                  if (included && item.placement === 'section_ad') {
                    const chosen = sectionSlots.find((section) => section.id === form.sectionSlot)
                    status = chosen ? `Included · ${chosen.label}` : 'Included · choose a slot below'
                  }
                  return (
                    <label
                      key={item.placement}
                      className={`flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm ${
                        included ? 'text-heading' : 'text-text-dim opacity-60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(included)}
                        disabled
                        readOnly
                        className="h-4 w-4 accent-[var(--color-accent)]"
                      />
                      <span className="min-w-0 flex-1 truncate">{included?.label ?? item.label}</span>
                      <span className="shrink-0 text-xs text-text-muted">{status}</span>
                    </label>
                  )
                })}
              </fieldset>
              {bundle.placements.some((item) => item.placement === 'section_ad') && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-heading">Section Ad slot</p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    Each slot covers a group of sections. Sold slots can't be chosen.
                  </p>
                  <div role="radiogroup" aria-label="Section Ad slot" className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {sectionSlots.map((section) => {
                      const selected = form.sectionSlot === section.id
                      const soldOut = section.open === 0 && !selected
                      return (
                        <button
                          key={section.id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          disabled={soldOut}
                          onClick={() => update('sectionSlot', section.id)}
                          className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-sm text-heading transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            selected ? 'border-accent bg-accent-bg ring-2 ring-accent' : 'border-border bg-bg hover:border-accent-border'
                          }`}
                        >
                          <span className="min-w-0 truncate">{section.label}</span>
                          <span className="shrink-0 text-xs text-text-muted">{soldOut ? 'Sold' : 'Open'}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          </>
        ) : (
          <div role="radiogroup" aria-label="Ad placement" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {PLACEMENT_SPECS.map((option) => {
              const selected = option.id === form.placement
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={locked}
                  onClick={() => update('placement', option.id)}
                  className={`flex flex-col rounded-2xl border p-3 text-left transition disabled:cursor-not-allowed ${
                    selected ? 'border-accent bg-accent-bg ring-2 ring-accent' : 'border-border bg-bg hover:border-accent-border'
                  }`}
                >
                  <div className="pointer-events-none" aria-hidden="true">
                    <AdPlacementPreview placement={option.id} creative={creativeFor(option.id)} brand={brand} />
                  </div>
                  <div className="mt-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-heading">{option.label}</p>
                      <p className="mt-0.5 text-xs text-text-muted">{option.summary}</p>
                    </div>
                    {selected && <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />}
                  </div>
                  <p className="mt-2 text-[11px] text-text-dim">
                    {option.sizeLabel} · {option.imageRequired ? 'Image required' : 'Image optional'}
                    {option.bodyRequired ? ' · Body text required' : ''}
                  </p>
                </button>
              )
            })}
          </div>
        )}
      </Section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6">
          <Section title="2. Campaign details">
            <Field label="Campaign name" hint="Only you see this name." counter={`${form.name.length}/120`}>
              <input
                className={inputClass}
                value={form.name}
                maxLength={120}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Spring launch"
                required
              />
            </Field>
          </Section>

          <Section
            title="3. Creative"
            description={
              isBundle
                ? bundle
                  ? `Shared across ${bundle.placements.map((item) => item.label).join(', ')}.`
                  : 'Choose a bundle to see which placements the creative covers.'
                : `${PLACEMENT_SPEC_BY_ID[form.placement].label}: ${PLACEMENT_SPEC_BY_ID[form.placement].where}.`
            }
          >
            <div className="space-y-4">
              <Field label="Headline" counter={`${form.headline.length}/80`}>
                <input
                  className={inputClass}
                  value={form.headline}
                  maxLength={80}
                  onChange={(e) => update('headline', e.target.value)}
                  placeholder="What should readers know?"
                />
              </Field>
              <Field
                label={requirements.bodyRequired ? 'Body text' : 'Body text (optional)'}
                counter={`${form.body.length}/200`}
              >
                <textarea
                  className={`${inputClass} min-h-[88px] resize-y`}
                  value={form.body}
                  maxLength={200}
                  onChange={(e) => update('body', e.target.value)}
                  placeholder="A sentence or two about your offer."
                />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
                <Field label="Button label" counter={`${form.ctaLabel.length}/24`}>
                  <input
                    className={inputClass}
                    value={form.ctaLabel}
                    maxLength={24}
                    onChange={(e) => update('ctaLabel', e.target.value)}
                  />
                </Field>
                <Field label="Destination URL" hint="Where readers go when they click your ad.">
                  <input
                    className={inputClass}
                    type="url"
                    inputMode="url"
                    value={form.destinationUrl}
                    maxLength={2048}
                    onChange={(e) => update('destinationUrl', e.target.value)}
                    placeholder="https://example.com/offer"
                  />
                </Field>
              </div>

              <div className="space-y-5">
                {imageSlots.length === 0 && (
                  <p className="text-xs text-text-muted">Choose a bundle to see the recommended sizes.</p>
                )}
                {imageSlots.map((spec) => {
                  const choice = imageChoiceFor(form, spec.id)
                  return (
                    <div key={spec.id}>
                      <p className="text-sm font-medium text-heading">
                        {isBundle ? `${spec.label} image` : 'Image'} {spec.imageRequired ? '' : '(optional)'}
                      </p>
                      <p className="mt-0.5 text-xs text-text-muted">Recommended size: {spec.sizeLabel}.</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        {choice ? (
                          <img
                            src={resolveAssetUrl(choice.url)}
                            alt={`Selected ${spec.label} ad`}
                            className="h-16 w-28 rounded-lg border border-border bg-surface object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-28 items-center justify-center rounded-lg border border-dashed border-border bg-surface text-text-dim">
                            <ImageIcon className="h-5 w-5" aria-hidden="true" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => setPickerPlacement(spec.id)}
                          className="rounded-xl border border-border px-3 py-2 text-sm font-medium text-heading hover:bg-surface"
                        >
                          {choice ? 'Change image' : 'Choose from Ad Library'}
                        </button>
                        {choice && (
                          <button
                            type="button"
                            onClick={() => setImage(spec.id, null)}
                            className="inline-flex items-center gap-1 rounded-xl px-2 py-2 text-sm text-text-muted hover:text-red-600"
                          >
                            <X className="h-4 w-4" />
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </Section>

          {requirements.targeted && (
            <Section
              title="4. Pages"
              description={`A Category Sponsor only appears on the pages you choose. Each extra page is $${(pageRate / 100).toFixed(0)} for ${form.durationDays} days; each bundle includes its Category Sponsor pages.`}
            >
              <fieldset disabled={locked}>
                <legend className="sr-only">Pages to show this ad on</legend>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {TARGET_PAGE_OPTIONS.map((page) => (
                    <label
                      key={page.id}
                      className="flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-heading hover:bg-surface disabled:cursor-not-allowed"
                    >
                      <input
                        type="checkbox"
                        checked={form.targetPages.includes(page.id)}
                        onChange={() => togglePage(page.id)}
                        className="h-4 w-4 accent-[var(--color-accent)]"
                      />
                      {page.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="mt-5 flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-heading">
                  Article categories{' '}
                  <span className="font-normal text-text-muted">
                    ({form.targetCategories.length} of {categories.length} selected)
                  </span>
                </p>
                <button
                  type="button"
                  onClick={toggleAllCategories}
                  disabled={locked || categories.length === 0}
                  className="text-sm font-medium text-accent hover:underline disabled:opacity-50"
                >
                  {allCategoriesSelected ? 'Clear all' : 'Select all'}
                </button>
              </div>
              {categoriesLoading && categories.length === 0 ? (
                <p className="mt-2 text-sm text-text-muted">Loading categories…</p>
              ) : categories.length === 0 ? (
                <p className="mt-2 text-sm text-text-muted">No categories have been added yet.</p>
              ) : (
                <fieldset disabled={locked} className="mt-2">
                  <legend className="sr-only">Article categories to show this ad on</legend>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {categories.map((category) => {
                      const open = categoryOpen(category.slug)
                      const soldOut = isCategorySoldOut(category.slug)
                      return (
                        <label
                          key={category.slug}
                          className={`flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-heading ${
                            soldOut ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-surface'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={form.targetCategories.includes(category.slug)}
                            disabled={soldOut}
                            onChange={() => toggleCategory(category.slug)}
                            className="h-4 w-4 accent-[var(--color-accent)]"
                          />
                          <span className="min-w-0 flex-1 truncate">{category.name}</span>
                          {open !== null && (
                            <span className={`shrink-0 text-xs ${soldOut ? 'font-medium text-text-muted' : 'text-text-dim'}`}>
                              {soldOut ? 'Sold out' : `${open} open`}
                            </span>
                          )}
                        </label>
                      )
                    })}
                  </div>
                </fieldset>
              )}
            </Section>
          )}

          <Section title={`${requirements.targeted ? '5' : '4'}. Duration & schedule`}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {form.placement === 'newsletter' && !isBundle ? (
                <Field label="Newsletter sends" hint={`Each send is ${formatMoney(catalog.placements.find((p) => p.placement === 'newsletter')?.prices[form.durationDays] ?? 0)} and runs within a ${NEWSLETTER_WINDOW_DAYS}-day window.`}>
                  <input
                    className={inputClass}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={MAX_NEWSLETTER_SENDS}
                    value={form.sends}
                    disabled={locked}
                    onChange={(e) => update('sends', Number(e.target.value))}
                  />
                </Field>
              ) : (
                <Field
                  label="Duration"
                  hint={
                    isBundle
                      ? 'Bundle prices scale with the run length.'
                      : form.placement === 'selected_page'
                        ? 'Price per page for this duration.'
                        : undefined
                  }
                >
                  <select
                    className={inputClass}
                    value={form.durationDays}
                    disabled={locked}
                    onChange={(e) => update('durationDays', Number(e.target.value) as CampaignDuration)}
                  >
                    {CAMPAIGN_DURATIONS.map((days) => (
                      <option key={days} value={days}>
                        {days} days
                      </option>
                    ))}
                  </select>
                </Field>
              )}
              <Field label="Start date">
                <input
                  className={inputClass}
                  type="date"
                  min={today}
                  value={form.startDate}
                  disabled={locked}
                  onChange={(e) => update('startDate', e.target.value)}
                />
              </Field>
              <Field label="Runs">
                <p className={`${inputClass} text-text-muted`}>
                  {endLabel ? `${form.startDate ? dayjs(form.startDate).format('MMM D') : ''} – ${endLabel}` : 'Choose a start date'}
                </p>
              </Field>
            </div>
          </Section>
        </div>

        <aside className="min-w-0 space-y-4 xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Live preview</p>
            {previewPlacements.length === 0 ? (
              <p className="mt-3 text-sm text-text-muted">Choose a bundle to preview its placements.</p>
            ) : (
              previewPlacements.map((placement) => (
                <div key={placement} className="mt-3 first:mt-3">
                  <p className="text-sm font-semibold text-heading">{PLACEMENT_SPEC_BY_ID[placement].label}</p>
                  <p className="text-xs text-text-muted">{PLACEMENT_SPEC_BY_ID[placement].where}</p>
                  <div className="mt-3">
                    <AdPlacementPreview placement={placement} creative={creativeFor(placement)} brand={brand} />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Price</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {priceLines.map((line) => (
                <li key={line.label} className="flex items-start justify-between gap-3 text-text-muted">
                  <span>{line.label}</span>
                  <span className="shrink-0 font-medium text-heading">{formatMoney(line.cents)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <span className="text-sm font-semibold text-heading">Total</span>
              <span className="text-lg font-bold text-heading">{formatMoney(totalCents)}</span>
            </div>
            {isBundle && bundle && (
              <p className="mt-2 text-xs text-emerald-600">
                You save {formatMoney(bundleSavingsCents)} compared with buying these placements individually.
              </p>
            )}
            <p className="mt-2 text-xs text-text-dim">Payment is collected after approval.</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            {problems.length === 0 ? (
              <p className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                Ready to submit
              </p>
            ) : (
              <>
                <p className={`flex items-center gap-2 text-sm font-medium ${showProblems ? 'text-red-600' : 'text-heading'}`}>
                  <AlertCircle className="h-4 w-4" />
                  {problems.length} item{problems.length === 1 ? '' : 's'} left before submitting
                </p>
                <ul role={showProblems ? 'alert' : undefined} className="mt-2 list-disc space-y-1 pl-5 text-xs text-text-muted">
                  {problems.map((problem) => (
                    <li key={problem}>{problem}</li>
                  ))}
                </ul>
              </>
            )}

            {error && (
              <p role="alert" className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Submit for review
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => persist(false)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-heading hover:bg-surface disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                Save draft
              </button>
            </div>
            {campaign && campaign.status !== 'draft' && (
              <p className="mt-3 text-xs text-text-muted">
                Saving a draft takes this campaign out of review until you submit it again.
              </p>
            )}
          </div>
        </aside>
      </div>

      <AssetPicker
        open={pickerPlacement !== null}
        selectedId={pickerPlacement ? (imageChoiceFor(form, pickerPlacement)?.assetId ?? null) : null}
        specs={pickerPlacement ? [PLACEMENT_SPEC_BY_ID[pickerPlacement]] : []}
        onClose={() => setPickerPlacement(null)}
        onSelect={(asset) => {
          if (pickerPlacement) setImage(pickerPlacement, { assetId: asset.id, url: asset.url })
        }}
      />
    </form>
  )
}

export function CreateCampaignPage() {
  const { id } = useParams<{ id: string }>()
  const campaign = useCampaign(id)
  const pricing = usePricing()

  const back = (
    <Link
      to="/advertiser/campaigns"
      className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-heading hover:bg-surface"
    >
      <ArrowLeft className="h-4 w-4" />
      All campaigns
    </Link>
  )

  if (pricing.isLoading) return <PageLoader label="Loading pricing…" />

  if (pricing.isError || !pricing.data) {
    return (
      <LoaderState alert title="Couldn't load pricing" message={getErrorMessage(pricing.error, 'Try again in a moment.')}>
        {back}
      </LoaderState>
    )
  }
  const catalog = pricing.data

  if (!id) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <AdvertiserPageHeader
          title="Create advertisement"
          description="Preview your ad in the Header, Category Sponsor, Sidepage, Newsletter and Footer placements, then pick the one that fits."
        >
          {back}
        </AdvertiserPageHeader>
        <CampaignForm catalog={catalog} />
      </div>
    )
  }

  if (campaign.isLoading) return <PageLoader label="Loading campaign…" />

  if (campaign.isError || !campaign.data) {
    return (
      <LoaderState alert title="Couldn't load this campaign" message={getErrorMessage(campaign.error, 'Campaign not found.')}>
        {back}
      </LoaderState>
    )
  }

  const editable = EDITABLE.includes(campaign.data.status)

  return (
    <div className="mx-auto w-full max-w-7xl">
      <AdvertiserPageHeader title="Edit advertisement" description={campaign.data.name}>
        <CampaignStatusBadge status={campaign.data.status} />
        {back}
      </AdvertiserPageHeader>
      {campaign.data.status === 'rejected' && campaign.data.reviewNote && (
        <p className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-600">Review note: {campaign.data.reviewNote}</p>
      )}
      {editable ? (
        <CampaignForm key={campaign.data.id} campaign={campaign.data} catalog={catalog} />
      ) : (
        <LoaderState
          compact
          title={campaign.data.status === 'active' ? 'Pause this campaign to edit it' : 'This campaign has ended'}
          message={
            campaign.data.status === 'active'
              ? 'Live campaigns cannot be changed. Pause it from the Campaigns page, make your edits, then submit it again.'
              : 'Completed campaigns cannot be edited.'
          }
        >
          {back}
        </LoaderState>
      )}
    </div>
  )
}
