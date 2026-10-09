import { Link } from 'react-router-dom'
import {
  Award,
  Ban,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  FolderLock,
  MessageCircle,
  Users,
  Wrench,
} from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'

const CAN_DO = [
  'Review and provide feedback on articles and investigations',
  'Evaluate sourcing and supporting evidence',
  'Collaborate with authors on drafts',
  'Help prepare journalism for publication',
]
const CANNOT_DO = ['Edit other editors', 'Override editorial independence', 'Publish articles under their own byline']
const EXPECTATIONS = ['Accuracy', 'Transparency', 'Constructive feedback', 'Editorial independence']
const TOOLS = [
  'Editorial review queue',
  'Evidence vault',
  'Source library',
  'Author collaboration tools',
  'Editor analytics',
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

export function BecomeEditorPage() {
  const { user } = useAuth()
  const isReader = user?.role === 'reader'

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 border-b border-[var(--color-card-border)] pb-8">
        <div className="mb-3 flex items-center gap-2 text-[var(--color-accent)]">
          <ClipboardCheck className="h-5 w-5" />
          <span className="text-sm font-semibold">Become an Editor</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-heading)]">
          Help shape journalism built on evidence.
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
          Editor accounts review reporting, evaluate evidence, and collaborate with authors to
          strengthen journalism before it's published. Here's what to expect before you apply.
        </p>

        {isReader ? (
          <Link
            to="/dashboard/become-editor/onboarding"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-on-brand transition"
          >
            Start Onboarding
          </Link>
        ) : (
          <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card)] px-4 py-2.5 text-sm text-[var(--color-card-text-muted)]">
            <CheckCircle2 className="h-4 w-4 text-[var(--color-verified)]" />
            You already have editor access.
          </div>
        )}
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <InfoCard icon={FileSearch} title="What editors can do" items={CAN_DO} tone="positive" />
        <InfoCard icon={Ban} title="What editors cannot do" items={CANNOT_DO} tone="negative" />
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
            <p className="text-sm font-semibold text-[var(--color-card-heading)]">Free Editor</p>
            <p className="mt-1 text-sm text-[var(--color-card-text-muted)]">Limited review queue</p>
          </div>
          <div className="rounded-xl border border-[var(--color-card-border)] p-4">
            <p className="text-sm font-semibold text-[var(--color-card-heading)]">Premium Editor</p>
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
              <MessageCircle className="h-4 w-4 text-[var(--color-card-text-dim)]" /> Profile photo &amp; short bio
            </li>
            <li className="flex items-center gap-2">
              <FileSearch className="h-4 w-4 text-[var(--color-card-text-dim)]" /> Social links (optional)
            </li>
          </ul>

          <div className="rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card-2)] p-4">
            <div className="flex items-center gap-2">
              <FolderLock className="h-4 w-4 text-[var(--color-accent)]" />
              <p className="text-sm font-semibold text-[var(--color-card-heading)]">Editorial Standards</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--color-card-text-muted)]">
              Every editor must accept our editorial standards, transparency requirements,
              correction policy, source verification rules, and commitment to constructive,
              independent editorial review.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
