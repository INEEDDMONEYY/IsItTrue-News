import { AdvertisementSectionLayout } from '../components/AdvertisementSectionLayout'
import { useState } from 'react'
import { AdvertisementQueryState, AdvertisementPill } from '../components/AdvertisementPrimitives'
import { useAdvertiserStatusMutation, useAdvertisers } from '../hooks/useAdvertisement'
import { requireAdvertisementSection } from '../utils/advertisementSections'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { formatDate } from '@/features/advertiser/utils/format'
import type { AdvertiserRow, AdvertiserStatus } from '../types/advertisement.types'

const section = requireAdvertisementSection('advertisers')

const STATUS_OPTIONS: Array<{ value: AdvertiserStatus | ''; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
]

// Pending and suspended advertisers can be activated; active advertisers can be suspended.
function nextStatus(advertiser: AdvertiserRow): AdvertiserStatus {
  return advertiser.status === 'active' ? 'suspended' : 'active'
}

function actionLabel(advertiser: AdvertiserRow): string {
  if (advertiser.status === 'active') return 'Suspend'
  return advertiser.status === 'pending' ? 'Activate' : 'Restore'
}

export function AdvertisementAdvertisersPage() {
  const [statusFilter, setStatusFilter] = useState<AdvertiserStatus | ''>('')
  const [notice, setNotice] = useState<string | null>(null)
  const { data, isLoading, error } = useAdvertisers(statusFilter || undefined)
  const statusMutation = useAdvertiserStatusMutation()

  function changeStatus(advertiser: AdvertiserRow) {
    setNotice(null)
    statusMutation.mutate(
      { id: advertiser.id, status: nextStatus(advertiser) },
      {
        onSuccess: (result) => {
          const paused = result.pausedCampaigns > 0 ? ` ${result.pausedCampaigns} live campaign(s) were paused.` : ''
          setNotice(`${result.advertiser.businessName} is now ${result.advertiser.status}.${paused}`)
        },
        onError: (err) => setNotice(getErrorMessage(err, 'Could not change this advertiser’s status.')),
      },
    )
  }

  return (
    <AdvertisementSectionLayout section={section}>
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-muted-foreground" htmlFor="advertiser-status">
          Status
        </label>
        <select
          id="advertiser-status"
          className="rounded-md border bg-background px-2 py-1 text-sm"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as AdvertiserStatus | '')}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {notice ? (
        <p role="status" className="rounded-md border p-3 text-sm">
          {notice}
        </p>
      ) : null}

      <AdvertisementQueryState
        isLoading={isLoading}
        error={error}
        isEmpty={data?.length === 0}
        emptyMessage="No advertisers match this filter."
      >
        {data ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-2 pr-4">Business</th>
                  <th className="py-2 pr-4">Contact email</th>
                  <th className="py-2 pr-4">Billing email</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Joined</th>
                  <th className="py-2 pr-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.map((advertiser) => (
                  <tr key={advertiser.id} className="border-b">
                    <td className="py-2 pr-4 font-medium">{advertiser.businessName}</td>
                    <td className="py-2 pr-4">{advertiser.email}</td>
                    <td className="py-2 pr-4">{advertiser.billingEmail || '—'}</td>
                    <td className="py-2 pr-4">
                      <AdvertisementPill>{advertiser.status}</AdvertisementPill>
                      {!advertiser.isEmailVerified ? (
                        <span className="ml-2 text-xs text-muted-foreground">email unverified</span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-4">{formatDate(advertiser.createdAt)}</td>
                    <td className="py-2 pr-4">
                      <button
                        type="button"
                        className="rounded-md border px-2 py-1 text-xs hover:bg-muted disabled:opacity-50"
                        disabled={statusMutation.isPending}
                        onClick={() => changeStatus(advertiser)}
                      >
                        {actionLabel(advertiser)}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </AdvertisementQueryState>
    </AdvertisementSectionLayout>
  )
}
