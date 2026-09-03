import { AppError } from '../../../shared/errors/AppError.js'
import { articleRepository } from '../../articles/repositories/article.repository.js'
import { articleService } from '../../articles/services/article.service.js'
import { videoRepository } from '../../videos/repositories/video.repository.js'
import { videoService } from '../../videos/services/video.service.js'

export type BookmarkContentType = 'article' | 'video'

export interface BookmarkItem {
  id: string
  contentType: BookmarkContentType
  title: string
  description?: string
  category?: string
  author?: string
  image?: string
  savedAt: string
  href: string
}

// Bookmarks aren't their own collection — they're tracked directly on the
// Article/Video documents (mirroring how likes/dislikes work), so "my
// bookmarks" is just a merge of both content types' bookmarked-by-me lists.
export const bookmarkService = {
  async toggle(contentType: BookmarkContentType, id: string, userId: string) {
    if (contentType === 'article') {
      const result = await articleService.toggleBookmark(id, userId)
      return result
    }
    if (contentType === 'video') {
      const result = await videoService.toggleBookmark(id, userId)
      return result
    }
    throw new AppError('Unsupported bookmark content type.', 400)
  },

  async listMine(userId: string): Promise<BookmarkItem[]> {
    const [bookmarkedArticles, bookmarkedVideos] = await Promise.all([
      articleRepository.findBookmarkedByUser(userId),
      videoRepository.findBookmarkedByUser(userId),
    ])

    const articleItems: BookmarkItem[] = bookmarkedArticles.map(({ article, savedAt }) => ({
      id: article.id as string,
      contentType: 'article',
      title: article.title,
      description: article.excerpt,
      category: article.category,
      image: article.articleImageUrl,
      savedAt: savedAt.toISOString(),
      href: `/article/${article.slug}`,
    }))

    const videoItems: BookmarkItem[] = bookmarkedVideos.map(({ video, savedAt }) => ({
      id: video.id as string,
      contentType: 'video',
      title: video.title,
      description: video.description,
      category: video.category,
      image: video.thumbnailUrl,
      savedAt: savedAt.toISOString(),
      href: `/videos/${video.id as string}`,
    }))

    return [...articleItems, ...videoItems].sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
    )
  },
}
