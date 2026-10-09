import { Link } from 'react-router-dom'
import {
  Award,
  Ban,
  BookOpen,
  Briefcase,
  CheckCircle2,
  FileText,
  FolderLock,
  PenLine,
  Sparkles,
  Users,
  Video,
  Wrench,
} from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'

const CAN_DO = ['Publish articles', 'Create investigations', 'Upload videos', 'Store evidence', 'Collaborate with editors']
const CANNOT_DO = ['Edit other authors', 'Approve investigations', 'Fact-check other writers']
const EXPECTATIONS = ['Accuracy', 'Transparency', 'Ethical reporting', 'Proper sourcing']
const TOOLS = [
  'Article editor',
  'Investigation builder',
  'Source library',
  'Evidence vault',
  'Video studio',
  'Author analytics',
]

function InfoCard({
  icon: Icon,
  title,
  items,
  tone = 'neutral',
}: {
  icon: typeof CheckCircle2
  title: string
  items: string[]
  tone?: 'neutral' | 'positive' | 'negative'
}) {
  const iconClasses =
    tone === 'positive'
      ? 'bg-[rgba(22,163,74,0.10)] text-[var(--color-verified)]'
      : tone === 'negative'
        ? 'bg-[rgba(220,38,38,0.10)] text-[var(--color-disputed)]'
        : 'bg-[var(--color-accent-bg)] text-[var(--color-accent)]'

  return (
    <section className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClasses}`}>
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-semibold text-[var(--color-card-heading)]">{title}</h2>
      </div>

      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-[var(--color-card-text-muted)]">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-card-text-dim)]" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}

export function BecomeAuthorPage() {
  const { user } = useAuth()
  const isReader = user?.role === 'reader'

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 border-b border-[var(--color-card-border)] pb-8">
        <div className="mb-3 flex items-center gap-2 text-[var(--color-accent)]">
          <Sparkles className="h-5 w-5" />
          <span className="text-sm font-semibold">Become an Author</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-heading)]">
          Report the truth. Build a byline.
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
          Author accounts can publish articles, run investigations, and upload videos — all
          backed by our editorial standards and Truth Protocol. Here's what to expect before you
          apply.
        </p>

        {isReader ? (
          <Link
            to="/dashboard/become-author/onboarding"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-on-brand transition"
          >
            Start Onboarding
          </Link>
        ) : (
          <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card)] px-4 py-2.5 text-sm text-[var(--color-card-text-muted)]">
            <CheckCircle2 className="h-4 w-4 text-[var(--color-verified)]" />
            You already have author access.
          </div>
        )}
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <InfoCard icon={FileText} title="What authors can do" items={CAN_DO} tone="positive" />
        <InfoCard icon={Ban} title="What authors cannot do" items={CANNOT_DO} tone="negative" />
        <InfoCard icon={Award} title="What's expected" items={EXPECTATIONS} />
        <InfoCard icon={Wrench} title="What tools they get" items={TOOLS} />
      </div>

      <section className="mt-6 rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
            <Briefcase className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--color-card-heading)]">Pricing</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--color-card-border)] p-4">
            <p className="text-sm font-semibold text-[var(--color-card-heading)]">Free Author</p>
            <p className="mt-1 text-sm text-[var(--color-card-text-muted)]">Limited publishing</p>
          </div>
          <div className="rounded-xl border border-[var(--color-card-border)] p-4">
            <p className="text-sm font-semibold text-[var(--color-card-heading)]">Premium Author</p>
            <p className="mt-1 text-sm text-[var(--color-card-text-muted)]">Full tools</p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
            <BookOpen className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--color-card-heading)]">What onboarding requires</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ul className="space-y-2 text-sm text-[var(--color-card-text-muted)]">
            <li className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[var(--color-card-text-dim)]" /> Full name
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[var(--color-card-text-dim)]" /> Email verification
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[var(--color-card-text-dim)]" /> Phone verification
            </li>
            <li className="flex items-center gap-2">
              <PenLine className="h-4 w-4 text-[var(--color-card-text-dim)]" /> Profile photo &amp; short bio
            </li>
            <li className="flex items-center gap-2">
              <Video className="h-4 w-4 text-[var(--color-card-text-dim)]" /> Social links (optional)
            </li>
          </ul>

          <div className="rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card-2)] p-4">
            <div className="flex items-center gap-2">
              <FolderLock className="h-4 w-4 text-[var(--color-accent)]" />
              <p className="text-sm font-semibold text-[var(--color-card-heading)]">Truth Protocol</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--color-card-text-muted)]">
              Every author must accept our editorial standards, transparency requirements,
              correction policy, source verification rules, and zero-tolerance policies on
              plagiarism, fabricated evidence, and undisclosed AI-generated news.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
