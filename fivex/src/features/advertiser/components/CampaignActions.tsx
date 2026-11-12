import { Link } from 'react-router-dom'
import { Loader2, Pause, Pencil, Play, Trash2 } from 'lucide-react'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { useCampaignActions } from '../hooks/useCampaigns'
import type { AdvertiserCampaign, CampaignStatus } from '../types/advertiser.types'

// Mirrors the server's EDITABLE_CAMPAIGN_STATUSES. An active campaign must be paused before it can be edited.
const EDITABLE: CampaignStatus[] = ['draft', 'pending_review', 'paused', 'rejected']
const PAUSE_TO_EDIT: CampaignStatus[] = ['active']

const buttonClass =
  'inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-medium text-text hover:bg-surface disabled:opacity-50'

export function CampaignActions({
  campaign,
  onError,
}: {
  campaign: AdvertiserCampaign
  onError: (message: string | null) => void
}) {
  const { pause, resume, remove } = useCampaignActions()
  const busy = pause.isPending || resume.isPending || remove.isPending
  const fail = (fallback: string) => (err: unknown) => onError(getErrorMessage(err, fallback))

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {EDITABLE.includes(campaign.status) && (
        <Link to={`/advertiser/campaigns/${campaign.id}/edit`} className={buttonClass} aria-label={`Edit ${campaign.name}`}>
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Link>
      )}

      {PAUSE_TO_EDIT.includes(campaign.status) && (
        <button
          type="button"
          className={buttonClass}
          disabled
          title="Pause this campaign to edit it"
          aria-label={`Edit ${campaign.name} (pause first)`}
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
      )}

      {campaign.status === 'active' && (
        <button
          type="button"
          className={buttonClass}
          disabled={busy}
          onClick={() => {
            onError(null)
            pause.mutate(campaign.id, { onError: fail('Could not pause the campaign.') })
          }}
        >
          {pause.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Pause className="h-3.5 w-3.5" />}
          Pause
        </button>
      )}

      {campaign.status === 'paused' && (
        <button
          type="button"
          className={buttonClass}
          disabled={busy}
          onClick={() => {
            onError(null)
            resume.mutate(campaign.id, { onError: fail('Could not resume the campaign.') })
          }}
        >
          {resume.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
          Resume
        </button>
      )}

      {campaign.status !== 'active' && (
        <button
          type="button"
          className={`${buttonClass} text-red-600 hover:bg-red-500/10`}
          disabled={busy}
          aria-label={`Delete ${campaign.name}`}
          onClick={() => {
            if (!window.confirm(`Delete "${campaign.name}"? This cannot be undone.`)) return
            onError(null)
            remove.mutate(campaign.id, { onError: fail('Could not delete the campaign.') })
          }}
        >
          {remove.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          Delete
        </button>
      )}
    </div>
  )
}
