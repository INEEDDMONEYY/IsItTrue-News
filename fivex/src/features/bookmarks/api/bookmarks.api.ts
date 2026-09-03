import { apiClient } from '@/api/client'
import type { BookmarkItem } from '../types/bookmark.types'

/**
 * Bookmarks aren't their own resource on the backend — they're tracked
 * directly on the article/video the user saved (mirroring likes/dislikes),
 * so this client just talks to the generic /api/bookmarks endpoints that
 * merge across content types.
 */
interface RawBookmark {
  id: string
  contentType: 'article' | 'video'
  title: string
  description?: string
  category?: string
  author?: string
  image?: string
  savedAt: string
  href: string
}

function toBookmarkItem(raw: RawBookmark): BookmarkItem {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    type: raw.contentType,
    category: raw.category,
    author: raw.author,
    image: raw.image,
    savedAt: raw.savedAt,
    href: raw.href,
  }
}

export const bookmarksApi = {
  listMine: async (): Promise<BookmarkItem[]> => {
    const { data } = await apiClient.get<{ bookmarks: RawBookmark[] }>('/api/bookmarks/mine')
    return data.bookmarks.map(toBookmarkItem)
  },

  toggle: async (
    contentType: 'article' | 'video',
    id: string,
  ): Promise<{ bookmarked: boolean; bookmarksCount: number }> => {
    const { data } = await apiClient.post<{ bookmarked: boolean; bookmarksCount: number }>(
      '/api/bookmarks/toggle',
      { contentType, id },
    )
    return data
  },
}
