import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileCheck2, FileSearch, ShieldCheck } from 'lucide-react'
import logo from '@/assets/icons/question-icon-removebg.png'
import { WaitlistForm } from '../components/WaitlistForm'
import { SocialLinks } from '../components/SocialLinks'

const PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Claims, checked one by one',
    body: 'Every claim in a story is tracked on its own, with who is responsible for it, what the evidence shows, and a clear verdict.',
  },
  {
    icon: FileSearch,
    title: 'Investigations with the evidence',
    body: 'Long-form reporting that shows its work, with timelines and the supporting evidence behind each finding.',
  },
  {
    icon: FileCheck2,
    title: 'Corrections in the open',
    body: 'When we get something wrong, we publish a numbered correction on the article instead of quietly editing it away.',
  },
]

function setMetaTag(name: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.name = name
    document.head.appendChild(tag)
  }
  tag.content = content
}

export function LandingPage() {
  useEffect(() => {
    document.title = 'IsItTrue News — Request early access'
    setMetaTag(
      'description',
      'IsItTrue News checks claims, shows the evidence, and corrects itself in public. Join the list for early access.',
    )
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5 md:px-8">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="" className="size-8" />
          <span className="text-base font-semibold text-heading">IsItTrue News</span>
        </div>
        <span className="rounded-full border border-accent-border bg-accent-bg px-3 py-1 text-xs font-medium text-accent">
          Opening soon
        </span>
      </header>

      <main className="flex-1">
        <section className="mx-auto w-full max-w-2xl px-5 pb-12 pt-10 text-center md:pt-16">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-heading md:text-5xl">
            News you can check for yourself.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-text-muted md:text-lg">
            IsItTrue News verifies claims, publishes the evidence behind them, and corrects itself in public. We&apos;re
            opening soon. Join the list and we&apos;ll let you in as soon as access opens.
          </p>

          <div className="mt-8 rounded-3xl border border-border bg-card p-5 shadow-sm md:p-7">
            <WaitlistForm />
          </div>
        </section>

        <section aria-label="What to expect" className="mx-auto w-full max-w-5xl px-5 pb-16 md:px-8">
          <ul className="grid gap-4 md:grid-cols-3">
            {PILLARS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="rounded-2xl border border-border bg-card p-5">
                <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-accent-bg">
                  <Icon aria-hidden="true" className="size-5 text-accent" />
                </div>
                <h2 className="text-sm font-semibold text-card-heading">{title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-card-text-muted">{body}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-5 py-5 text-xs text-text-dim md:px-8">
          <span>© {new Date().getFullYear()} IsItTrue News</span>
          <SocialLinks />
          <Link to="/dev-access" className="hover:text-text">
            Team access
          </Link>
        </div>
      </footer>
    </div>
  )
}
