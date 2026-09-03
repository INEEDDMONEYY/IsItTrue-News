import { apiClient } from '@/api/client'

export interface CommentAuthor {
  id: string
  name: string
}

export interface CommentArticleRef {
  id: string
  title: string
  slug: string
}

export interface Comment {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  author: CommentAuthor | string
  article: CommentArticleRef | string
  likes: number
}

/**
 * Thin wrapper around the real /api/comments routes.
 */
export const commentsApi = {
  listByArticle: async (
    articleId: string,
  ): Promise<{ comments: Comment[]; likedCommentIds: string[] }> => {
    const { data } = await apiClient.get<{ comments: Comment[]; likedCommentIds: string[] }>(
      `/api/comments/article/${articleId}`,
    )
    return data
  },

  listMine: async (): Promise<Comment[]> => {
    const { data } = await apiClient.get<{ comments: Comment[] }>('/api/comments/mine')
    return data.comments
  },

  listOnMyArticles: async (): Promise<Comment[]> => {
    const { data } = await apiClient.get<{ comments: Comment[] }>(
      '/api/comments/on-my-articles',
    )
    return data.comments
  },

  create: async (articleId: string, content: string): Promise<Comment> => {
    const { data } = await apiClient.post<{ comment: Comment }>('/api/comments', {
      articleId,
      content,
    })
    return data.comment
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/comments/${id}`)
  },

  toggleLike: async (id: string): Promise<{ liked: boolean; likesCount: number }> => {
    const { data } = await apiClient.post<{ liked: boolean; likesCount: number }>(
      `/api/comments/${id}/like`,
    )
    return data
  },
}
