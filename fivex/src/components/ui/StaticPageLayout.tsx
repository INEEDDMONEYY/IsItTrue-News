import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ChevronDown } from 'lucide-react'
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
  // First section starts expanded so the page never looks empty; the rest
  // are collapsed dropdowns the reader opens as needed.
  const [openHeadings, setOpenHeadings] = useState<Set<string>>(
    () => new Set(sections[0] ? [sections[0].heading] : []),
  )

  const toggleSection = (heading: string) => {
    setOpenHeadings((prev) => {
      const next = new Set(prev)
      if (next.has(heading)) {
        next.delete(heading)
      } else {
        next.add(heading)
      }
      return next
    })
  }

  return (
    <div className="max-w-[820px] mx-auto px-4 py-10 md:py-14">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-accent transition-colors mb-8"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to home
      </Link>

      <div className="rounded-2xl border border-border bg-surface shadow-sm p-6 md:p-10">
        <h1 className="text-3xl md:text-[2.5rem] font-bold tracking-tight text-heading mb-2">
          {title}
        </h1>

        {lastUpdated && (
          <p className="text-xs font-medium uppercase tracking-wide text-text-dim mb-6">
            Last updated {lastUpdated}
          </p>
        )}

        {intro && (
          <p className="text-base text-text leading-relaxed border-l-4 border-accent bg-surface-2 rounded-r-lg px-4 py-3 mb-10">
            {intro}
          </p>
        )}

        <div className="flex flex-col divide-y divide-border">
          {sections.map((section) => {
            const isOpen = openHeadings.has(section.heading)
            return (
              <div key={section.heading} className="py-2">
                <button
                  type="button"
                  onClick={() => toggleSection(section.heading)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-3 text-left"
                >
                  <span className="text-lg font-semibold text-heading">
                    {section.heading}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 text-text-muted transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-accent' : ''
                    }`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="flex flex-col gap-3 pb-4">
                      {section.body.map((paragraph, i) => (
                        <p key={i} className="text-sm text-text leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
