import { Lightbulb } from 'lucide-react'

import { EmptyStateCard } from '@/components/cards'

export function PitchCenterPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-sm font-semibold text-[var(--color-accent)]">
          Author Workspace
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-heading)] sm:text-4xl">
          Pitch Center
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
          Propose story ideas to editors and track their status before you
          start writing.
        </p>
      </header>

      <EmptyStateCard
        icon={Lightbulb}
        title="No pitches yet"
        description="Submitted story pitches and editor feedback will show up here."
      />
    </main>
  )
}
