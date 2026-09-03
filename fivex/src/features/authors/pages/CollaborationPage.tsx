import { UserPen } from 'lucide-react'

import { EmptyStateCard } from '@/components/cards'
import { PaywallGate } from '@/features/billing/components/PaywallGate'

export function CollaborationPage() {
  return (
    <PaywallGate feature="collaboration">
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <p className="text-sm font-semibold text-[var(--color-accent)]">
            Author Workspace
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-heading)] sm:text-4xl">
            Collaboration Room
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
            Work alongside co-authors, editors, and fact-checkers on shared
            stories in real time.
          </p>
        </header>

        <EmptyStateCard
          icon={UserPen}
          title="No active collaborations"
          description="Shared drafts and co-author invitations will show up here."
        />
      </main>
    </PaywallGate>
  )
}
