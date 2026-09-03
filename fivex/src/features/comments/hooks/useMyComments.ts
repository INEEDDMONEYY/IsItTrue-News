import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { commentsApi, type Comment } from '../api/comments.api'
import type {
  CommentFilters,
  CommentView,
  MyComment,
} from '../types/comment.types'

// The backend Comment model has no moderation workflow or per-comment
// reactions yet, so status is always "published" and likes/dislikes are
// always 0 — kept on the shape so the existing stats/table UI still works.
function toMyComment(comment: Comment, isOwnComment: boolean): MyComment {
  const article = typeof comment.article === 'object' ? comment.article : null
  const author = typeof comment.author === 'object' ? comment.author : null

  return {
    id: comment.id,
    articleId: article?.id ?? '',
    articleTitle: article?.title ?? 'Untitled article',
    articleSlug: article?.slug ?? '',
    authorName: author?.name ?? 'Reader',
    content: comment.content,
    createdAt: comment.createdAt,
    likes: 0,
    dislikes: 0,
    status: 'published',
    isOwnComment,
  }
}

export function useMyComments() {
  const [filters, setFilters] = useState<CommentFilters>({
    view: 'my-comments',
    status: 'all',
    search: '',
  })

  const { data: myComments = [], isLoading: isLoadingMine } = useQuery({
    queryKey: ['comments', 'mine'],
    queryFn: commentsApi.listMine,
    enabled: filters.view === 'my-comments',
  })

  const { data: commentsOnMyPosts = [], isLoading: isLoadingOnPosts } = useQuery({
    queryKey: ['comments', 'on-my-articles'],
    queryFn: commentsApi.listOnMyArticles,
    enabled: filters.view === 'on-my-posts',
  })

  const isLoading = filters.view === 'my-comments' ? isLoadingMine : isLoadingOnPosts

  const comments = useMemo<MyComment[]>(() => {
    const source =
      filters.view === 'my-comments'
        ? myComments.map((comment) => toMyComment(comment, true))
        : commentsOnMyPosts.map((comment) => toMyComment(comment, false))

    const search = filters.search?.trim().toLowerCase() ?? ''

    return source.filter((comment) => {
      const matchesStatus =
        !filters.status || filters.status === 'all' || comment.status === filters.status

      const matchesSearch =
        !search ||
        comment.content.toLowerCase().includes(search) ||
        comment.articleTitle.toLowerCase().includes(search) ||
        comment.authorName.toLowerCase().includes(search)

      return matchesStatus && matchesSearch
    })
  }, [filters.view, filters.status, filters.search, myComments, commentsOnMyPosts])

  const stats = useMemo(() => {
    return comments.reduce(
      (totals, comment) => ({
        total: totals.total + 1,
        likes: totals.likes + comment.likes,
        dislikes: totals.dislikes + comment.dislikes,
      }),
      {
        total: 0,
        likes: 0,
        dislikes: 0,
      },
    )
  }, [comments])

  const setView = (view: CommentView) => {
    setFilters((current) => ({
      ...current,
      view,
    }))
  }

  const setSearch = (search: string) => {
    setFilters((current) => ({
      ...current,
      search,
    }))
  }

  return {
    comments,
    stats,
    filters,
    setFilters,
    setView,
    setSearch,
    isLoading,
  }
}