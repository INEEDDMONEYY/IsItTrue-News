import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Article } from '@/shared/types/article.types'

export function EditorsPicksCarousel({ articles }: { articles: Article[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollBy = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' })
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-card-heading">Editor's Picks</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollBy(-1)}
            aria-label="Scroll left"
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-muted hover:text-text hover:border-accent-border transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollBy(1)}
            aria-label="Scroll right"
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-muted hover:text-text hover:border-accent-border transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {articles.map((article) => (
          <Link
            key={article.id}
            to={`/article/${article.slug}`}
            className="group shrink-0 w-[280px] rounded-2xl border border-card-border bg-card overflow-hidden hover:border-accent-border transition-colors"
          >
            <div className="aspect-[4/3] bg-card-2" />
            <div className="p-4 flex flex-col gap-2">
              <span className="text-[11px] uppercase tracking-wide font-medium text-accent w-fit">
                {article.category.name}
              </span>
              <h4 className="text-sm font-semibold text-card-heading leading-snug group-hover:text-accent transition-colors line-clamp-2">
                {article.title}
              </h4>
              {article.excerpt && (
                <p className="text-xs text-card-text-dim leading-relaxed line-clamp-2">
                  {article.excerpt}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}