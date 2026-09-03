import { ShieldCheck, Sparkles, Zap } from 'lucide-react'

const REASONS = [
  {
    icon: Zap,
    title: 'Work faster',
    description:
      'Drafts, pitches, and investigations all live in one connected workspace.',
  },
  {
    icon: ShieldCheck,
    title: 'Stay organized',
    description:
      'Evidence Vault keeps every source, document, and recording in one secure place.',
  },
  {
    icon: Sparkles,
    title: 'Prove your impact',
    description:
      'Advanced analytics show exactly how your reporting performs.',
  },
]

export function SubscribeHero() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-accent)]">
        IsItTrue News Premium
      </p>

      <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-heading)] sm:text-4xl">
        Unlock the plan for you
      </h1>

      <p className="mt-4 text-base leading-7 text-[var(--color-text-muted)]">
        Subscribe to get access to the tools that help working journalists
        research, collaborate, and publish with confidence.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {REASONS.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-6 text-left"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
              <Icon className="h-5 w-5" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-[var(--color-card-heading)]">
              {title}
            </h3>

            <p className="mt-1.5 text-sm leading-6 text-[var(--color-card-text-muted)]">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
