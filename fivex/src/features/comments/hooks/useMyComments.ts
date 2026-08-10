import { useMemo, useState } from 'react'
import { mockMyComments } from '../data/mockMyComments'
import type {
  CommentFilters,
  CommentView,
  MyComment,
} from '../types/comment.types'

export function useMyComments() {
  const [filters, setFilters] = useState<CommentFilters>({
    view: 'my-comments',
    status: 'all',
    search: '',
  })

  const comments = useMemo<MyComment[]>(() => {
    return mockMyComments.filter((comment) => {
      const matchesView =
        filters.view === 'my-comments'
          ? comment.isOwnComment
          : !comment.isOwnComment

      const matchesStatus =
        !filters.status ||
        filters.status === 'all' ||
        comment.status === filters.status

      const search = filters.search?.trim().toLowerCase() ?? ''

      const matchesSearch =
        !search ||
        comment.content.toLowerCase().includes(search) ||
        comment.articleTitle.toLowerCase().includes(search) ||
        comment.authorName.toLowerCase().includes(search)

      return matchesView && matchesStatus && matchesSearch
    })
  }, [filters])

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
  }
}