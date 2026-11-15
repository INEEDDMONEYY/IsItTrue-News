import { AdvertisementSectionLayout } from '../components/AdvertisementSectionLayout'
import { useState } from 'react'
import { AdvertisementBackendGap } from '../components/AdvertisementBackendGap'
import { AdvertisementQueryState, AdvertisementPill } from '../components/AdvertisementPrimitives'
import {
  useAdvertiserStatusMutation,
  useAdvertisers,
  useApprovals,
  useCampaignReviewMutations,
} from '../hooks/useAdvertisement'
import { requireAdvertisementSection } from '../utils/advertisementSections'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { PLACEMENT_LABELS, formatDate, formatMoney } from '@/features/advertiser/utils/format'
import type { CampaignRow } from '../types/advertisement.types'

const section = requireAdvertisementSection('approvals')

const MIN_NOTE = 3
const MAX_NOTE = 500

function ReviewRow({
  campaign,
  onDone,
}: {
  campaign: CampaignRow
  onDone: (message: string) => void
}) {
  const { approve, reject } = useCampaignReviewMutations()
  const [rejecting, setRejecting] = useState(false)
  const [note, setNote] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const busy = approve.isPending || reject.isPending

  function submitReject() {
    const trimmed = note.trim()
    if (trimmed.length < MIN_NOTE || trimmed.length > MAX_NOTE) {
      setLocalError(`A reason of ${MIN_NOTE}–${MAX_NOTE} characters is required.`)
      return
    }
    setLocalError(null)
    reject.mutate(
      { id: campaign.id, reviewNote: trimmed },
      {
        onSuccess: () => onDone(`${campaign.name} was rejected.`),
        onError: (err) => setLocalError(getErrorMessage(err, 'Could not reject this campaign.')),
      },
    )
  }

  return (
    <li className="space-y-2 rounded-lg border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium">{campaign.name}</p>
          <p className="text-xs text-muted-foreground">
            {campaign.advertiser?.businessName ?? 'Unknown advertiser'} · {PLACEMENT_LABELS[campaign.placement]} ·{' '}
            {formatMoney(campaign.budgetCents)} · {formatDate(campaign.startDate)} – {formatDate(campaign.endDate)}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy}
            className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground disabled:opacity-50"
            onClick={() =>
              approve.mutate(campaign.id, {
                onSuccess: () => onDone(`${campaign.name} was approved.`),
                onError: (err) => setLocalError(getErrorMessage(err, 'Could not approve this campaign.')),
              })
            }
          >
            Approve
          </button>
          <button
            type="button"
            disabled={busy}
            className="rounded-md border px-3 py-1 text-sm hover:bg-muted disabled:opacity-50"
            onClick={() => setRejecting((value) => !value)}
          >
            Reject
          </button>
        </div>
      </div>
      {rejecting ? (
        <div className="space-y-2">
          <label className="block text-sm" htmlFor={`reject-${campaign.id}`}>
            Reason shown to the advertiser
          </label>
          <textarea
            id={`reject-${campaign.id}`}
            className="w-full rounded-md border bg-background p-2 text-sm"
            rows={2}
            maxLength={MAX_NOTE}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <button
            type="button"
            disabled={busy}
            className="rounded-md bg-destructive px-3 py-1 text-sm text-destructive-foreground disabled:opacity-50"
            onClick={submitReject}
          >
            Confirm rejection
          </button>
        </div>
      ) : null}
      {localError ? (
        <p role="alert" className="text-sm text-destructive">
          {localError}
        </p>
      ) : null}
    </li>
  )
}

export function AdvertisementApprovalsPage() {
  const [notice, setNotice] = useState<string | null>(null)
  const campaigns = useApprovals()
  const pendingAdvertisers = useAdvertisers('pending')
  const advertiserStatus = useAdvertiserStatusMutation()

  return (
    <AdvertisementSectionLayout section={section}>
      {notice ? (
        <p role="status" className="rounded-md border p-3 text-sm">
          {notice}
        </p>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Campaigns awaiting review</h2>
        <AdvertisementQueryState
          isLoading={campaigns.isLoading}
          error={campaigns.error}
          isEmpty={campaigns.data?.length === 0}
          emptyMessage="No campaigns are waiting for review."
        >
          <ul className="space-y-3">
            {campaigns.data?.map((campaign) => (
              <ReviewRow key={campaign.id} campaign={campaign} onDone={setNotice} />
            ))}
          </ul>
        </AdvertisementQueryState>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Advertisers awaiting activation</h2>
        <AdvertisementQueryState
          isLoading={pendingAdvertisers.isLoading}
          error={pendingAdvertisers.error}
          isEmpty={pendingAdvertisers.data?.length === 0}
          emptyMessage="No advertisers are waiting for activation."
        >
          <ul className="space-y-3">
            {pendingAdvertisers.data?.map((advertiser) => (
              <li key={advertiser.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
                <div>
                  <p className="font-medium">{advertiser.businessName}</p>
                  <p className="text-xs text-muted-foreground">
                    {advertiser.email} · joined {formatDate(advertiser.createdAt)}
                  </p>
                  {!advertiser.isEmailVerified ? (
                    <AdvertisementPill>email not verified</AdvertisementPill>
                  ) : null}
                </div>
                <button
                  type="button"
                  disabled={advertiserStatus.isPending}
                  className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground disabled:opacity-50"
                  onClick={() =>
                    advertiserStatus.mutate(
                      { id: advertiser.id, status: 'active' },
                      {
                        onSuccess: (result) => setNotice(`${result.advertiser.businessName} was activated.`),
                        onError: (err) => setNotice(getErrorMessage(err, 'Could not activate this advertiser.')),
                      },
                    )
                  }
                >
                  Activate
                </button>
              </li>
            ))}
          </ul>
        </AdvertisementQueryState>
      </section>

      <AdvertisementBackendGap section={section} />
    </AdvertisementSectionLayout>
  )
}
