import { BookMarked } from 'lucide-react'
import { EmptyStateCard } from '@/components/cards'

export function BookmarksPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-heading mb-1">Bookmarks</h1>
      <p className="text-sm text-text-muted mb-6">Articles and fact checks you've saved to read later.</p>

      <EmptyStateCard
        icon={BookMarked}
        title="No bookmarks yet"
        description="Save an article from its detail page and it will show up here once the bookmarks API is connected."
      />
    </div>
  )
}
