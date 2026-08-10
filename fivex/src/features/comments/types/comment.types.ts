export type CommentView = 'my-comments' | 'on-my-posts'

export type CommentStatus =
  | 'published'
  | 'pending'
  | 'flagged'
  | 'removed'

export interface MyComment {
  id: string
  articleId: string
  articleTitle: string
  articleSlug: string
  authorName: string
  authorRole?: string
  content: string
  createdAt: string
  likes: number
  dislikes: number
  status: CommentStatus
  isOwnComment: boolean
}

export interface CommentStats {
  total: number
  likes: number
  dislikes: number
}

export interface CommentFilters {
  view: CommentView
  status?: CommentStatus | 'all'
  search?: string
}