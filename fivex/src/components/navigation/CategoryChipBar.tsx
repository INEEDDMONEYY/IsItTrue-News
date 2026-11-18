import { useRef, type MouseEvent, type PointerEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useCategories } from '@/features/categories/hooks/useCategories'

// Full-width, horizontally scrollable row of category chips. Full width on mobile; capped and centred on desktop.
// Mouse users drag the row sideways because the arrows and scrollbar are hidden.
export function CategoryChipBar() {
  const { categories } = useCategories()
  const { pathname } = useLocation()
  const scrollRef = useRef<HTMLDivElement>(null)
  const drag = useRef({ active: false, moved: false, startX: 0, startLeft: 0 })

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || !scrollRef.current) return
    drag.current = { active: true, moved: false, startX: event.clientX, startLeft: scrollRef.current.scrollLeft }
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current
    const state = drag.current
    if (!state.active || !el) return
    const dx = event.clientX - state.startX
    if (Math.abs(dx) > 4) state.moved = true
    if (state.moved) el.scrollLeft = state.startLeft - dx
  }

  const endDrag = () => {
    drag.current.active = false
  }

  // A drag should not follow a chip link when the mouse is released.
  const onClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (drag.current.moved) {
      event.preventDefault()
      event.stopPropagation()
      drag.current.moved = false
    }
  }

  return (
    <div className="flex h-11 w-full items-center px-4 md:mx-auto md:max-w-[1400px] md:px-8">
      <div
        ref={scrollRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        className="flex min-w-0 cursor-grab select-none items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {categories.map((category) => {
          const isActive = pathname === `/category/${category.slug}`
          return (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              aria-current={isActive ? 'page' : undefined}
              className={`shrink-0 flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-brand-gradient font-semibold'
                  : 'gradient-border-chip text-text-muted hover:text-text'
              }`}
            >
              {category.name}
              <Plus className="w-3 h-3" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
