import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import type { VerificationStatus } from '@/shared/types/article.types'
import { FACT_CHECKS } from '../data/mockFactChecks'
import { FactCheckCard } from '../components/FactCheckCard'

const FILTERS: { label: string; value: VerificationStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Verified', value: 'verified' },
  { label: 'Disputed', value: 'disputed' },
  { label: 'Under Review', value: 'pending' },
  { label: 'Unverified', value: 'unverified' },
]

export function FactChecksPage() {
  const [filter, setFilter] = useState<VerificationStatus | 'all'>('all')

  const visible =
    filter === 'all' ? FACT_CHECKS : FACT_CHECKS.filter((fc) => fc.verdict === filter)

  return (
    <div className="py-6 md:py-10 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-accent-bg flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-heading">Fact Checks</h1>
          <p className="text-sm text-text-muted">
            Claims circulating in the news and online, checked against primary sources.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            onClick={() => setFilter(item.value)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm border transition-colors ${
              filter === item.value
                ? 'bg-heading text-bg border-heading'
                : 'border-border text-text-muted hover:text-text hover:border-accent-border'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-text-muted">No fact checks match this filter yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map((factCheck) => (
            <FactCheckCard key={factCheck.id} factCheck={factCheck} />
          ))}
        </div>
      )}
    </div>
  )
}
