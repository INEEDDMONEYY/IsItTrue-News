import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useCategories } from '@/features/categories/hooks/useCategories'

// Horizontally scrollable row of category chips with arrow buttons. Used in the header on desktop and at the top of mobile pages.
export function CategoryChipBar() {
  const { categories } = useCategories()
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollTopics = (direction: 'left' | 'right') => {
    scrollRef.current?.scrollBy({
      left: direction === 'left' ? -240 : 240,
      behavior: 'smooth',
    })
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-11 flex items-center gap-2">
      <button
        type="button"
        aria-label="Scroll categories left"
        onClick={() => scrollTopics('left')}
        className="shrink-0 p-1 rounded-full text-text-muted hover:text-text hover:bg-surface transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/category/${category.slug}`}
            className="gradient-border-chip shrink-0 flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full text-xs text-text-muted hover:text-text transition-colors whitespace-nowrap"
          >
            {category.name}
            <Plus className="w-3 h-3" />
          </Link>
        ))}
      </div>

      <button
        type="button"
        aria-label="Scroll categories right"
        onClick={() => scrollTopics('right')}
        className="shrink-0 p-1 rounded-full text-text-muted hover:text-text hover:bg-surface transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
