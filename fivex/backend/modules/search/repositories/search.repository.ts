import { Article } from '../../articles/models/Article.js'
import { ARTICLE_STATUSES } from '../../articles/constants/articleStatus.js'
import { Video } from '../../videos/models/Video.js'
import { VIDEO_STATUSES } from '../../videos/constants/videoStatus.js'
import { User } from '../../users/models/User.js'
import { ROLES } from '../../../shared/constants/roles.js'
import { Category } from '../../categories/models/Category.js'
import { Tag } from '../../tags/models/Tag.js'

const RESULTS_PER_TYPE = 6

export interface SearchResultItem {
  id: string
  type: 'article' | 'video' | 'author' | 'topic'
  title: string
  description?: string
  imageUrl?: string
  href: string
}


export const searchRepository = {
  async searchArticles(regex: RegExp): Promise<SearchResultItem[]> {
    const articles = await Article.find({
      status: ARTICLE_STATUSES.PUBLISHED,
      $or: [{ title: regex }, { excerpt: regex }, { tags: regex }],
    })
      .sort({ publishedAt: -1 })
      .limit(RESULTS_PER_TYPE)

    return articles.map((article) => ({
      id: String(article._id),
      type: 'article',
      title: article.title,
      description: article.excerpt,
      imageUrl: article.articleImageUrl,
      href: `/article/${article.slug}`,
    }))
  },

  async searchVideos(regex: RegExp): Promise<SearchResultItem[]> {
    const videos = await Video.find({
      status: VIDEO_STATUSES.PUBLISHED,
      visibility: 'public',
      $or: [{ title: regex }, { description: regex }, { tags: regex }],
    })
      .sort({ publishedAt: -1 })
      .limit(RESULTS_PER_TYPE)

    return videos.map((video) => ({
      id: String(video._id),
      type: 'video',
      title: video.title,
      description: video.description,
      imageUrl: video.thumbnailUrl,
      href: `/videos/${video._id}`,
    }))
  },

  async searchAuthors(regex: RegExp): Promise<SearchResultItem[]> {
    const authors = await User.find({
      role: ROLES.AUTHOR,
      $or: [{ name: regex }, { 'authorProfile.professionalName': regex }],
    }).limit(RESULTS_PER_TYPE)

    return authors.map((author) => ({
      id: String(author._id),
      type: 'author',
      title: author.authorProfile?.professionalName || author.name,
      description: author.authorProfile?.bio,
      imageUrl: author.authorProfile?.profileImage,
      href: `/authors/${author._id}`,
    }))
  },

  async searchTopics(regex: RegExp): Promise<SearchResultItem[]> {
    const [categories, tags] = await Promise.all([
      Category.find({ name: regex }).limit(RESULTS_PER_TYPE),
      Tag.find({ name: regex }).limit(RESULTS_PER_TYPE),
    ])

    const results: SearchResultItem[] = [
      ...categories.map((category) => ({
        id: String(category._id),
        type: 'topic' as const,
        title: category.name,
        href: `/category/${category.slug}`,
      })),
      ...tags.map((tag) => ({
        id: String(tag._id),
        type: 'topic' as const,
        title: tag.name,
        href: `/tag/${tag.slug}`,
      })),
    ]

    return results.slice(0, RESULTS_PER_TYPE)
  },
}
