import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { LoaderState } from '@/components/loaders/LoaderState'
import { PageLoader } from '@/components/loaders/PageLoader'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { AdvertiserPageHeader } from '../components/AdvertiserPageHeader'
import { CampaignCard } from '../components/CampaignCard'
import { CampaignTable } from '../components/CampaignTable'
import { useCampaigns } from '../hooks/useCampaigns'
import type { CampaignStatus } from '../types/advertiser.types'
import { STATUS_LABELS } from '../utils/format'

const FILTERS: Array<{ id: CampaignStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  ...(['active', 'pending_review', 'draft', 'paused', 'rejected', 'completed'] as CampaignStatus[]).map((status) => ({
    id: status,
    label: STATUS_LABELS[status],
  })),
]

export function CampaignsPage() {
  const location = useLocation()
  const notice = (location.state as { notice?: string } | null)?.notice
  const [status, setStatus] = useState<CampaignStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(search.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [search])

  const campaigns = useCampaigns({ status: status === 'all' ? undefined : status, q: query || undefined })
  const list = campaigns.data ?? []
  const filtered = status !== 'all' || query !== ''

  return (
    <div className="mx-auto w-full max-w-7xl">
      <AdvertiserPageHeader title="Campaigns" description="Create, schedule and manage every advertisement you run on IsItTrue News.">
        <Link
          to="/advertiser/campaigns/new"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-accent-hover"
        >
          <Plus className="h-4 w-4" />
          Create advertisement
        </Link>
      </AdvertiserPageHeader>

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label="Filter by status" className="flex flex-wrap gap-1.5">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={status === filter.id}
              onClick={() => setStatus(filter.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                status === filter.id
                  ? 'bg-accent text-white'
                  : 'border border-border bg-card text-text hover:border-accent-border'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <label className="relative block w-full lg:w-72">
          <span className="sr-only">Search campaigns</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-dim" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name"
            maxLength={100}
            className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-3 text-sm text-heading placeholder:text-text-dim focus:border-accent focus:outline-none"
          />
        </label>
      </div>

      {notice && (
        <p role="status" className="mb-4 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
          {notice}
        </p>
      )}

      {actionError && (
        <p role="alert" className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-600">
          {actionError}
        </p>
      )}

      {campaigns.isLoading ? (
        <PageLoader label="Loading campaigns…" />
      ) : campaigns.isError ? (
        <LoaderState alert title="Couldn't load campaigns" message={getErrorMessage(campaigns.error)}>
          <button type="button" onClick={() => campaigns.refetch()} className="text-sm font-semibold text-accent hover:underline">
            Try again
          </button>
        </LoaderState>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm font-semibold text-heading">{filtered ? 'No campaigns match' : 'No campaigns yet'}</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-text-muted">
            {filtered
              ? 'Try another status or search term.'
              : 'Create your first advertisement and preview it in every placement before it goes live.'}
          </p>
          {!filtered && (
            <Link to="/advertiser/campaigns/new" className="mt-4 inline-block text-sm font-semibold text-accent hover:underline">
              Create advertisement
            </Link>
          )}
        </div>
      ) : (
        <>
          <CampaignTable campaigns={list} onError={setActionError} />
          <div className="space-y-3 md:hidden">
            {list.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} onError={setActionError} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
