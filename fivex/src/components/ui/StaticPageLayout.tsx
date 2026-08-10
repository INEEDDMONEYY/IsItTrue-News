import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { StaticPageSection } from '@/shared/types/staticPage.types'

interface StaticPageLayoutProps {
  title: string
  lastUpdated?: string
  intro?: string
  sections: StaticPageSection[]
}

export function StaticPageLayout({
  title,
  lastUpdated,
  intro,
  sections,
}: StaticPageLayoutProps) {
  return (
    <div className="max-w-[760px] mx-auto py-10 md:py-14">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors mb-8"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to home
      </Link>

      <h1 className="text-3xl md:text-4xl font-semibold text-heading mb-2">
        {title}
      </h1>

      {lastUpdated && (
        <p className="text-sm text-text-dim mb-6">Last updated {lastUpdated}</p>
      )}

      {intro && (
        <p className="text-base text-text leading-relaxed mb-10">{intro}</p>
      )}

      <div className="flex flex-col gap-8">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-lg font-semibold text-heading mb-3">
              {section.heading}
            </h2>
            <div className="flex flex-col gap-3">
              {section.body.map((paragraph, i) => (
                <p key={i} className="text-sm text-text leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}