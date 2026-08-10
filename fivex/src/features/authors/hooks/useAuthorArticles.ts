
import { useMemo, useState } from 'react'

import { mockAuthorArticles } from '../data/mockAuthorArticles'
import type {
  AuthorArticle,
  AuthorArticleStatus,
} from '../types/authorArticle.types'

export function useAuthorArticles() {
  const [articles, setArticles] =
    useState<AuthorArticle[]>(mockAuthorArticles)

  const [search, setSearch] = useState('')

  const [status, setStatus] = useState<
    AuthorArticleStatus | 'all'
  >('all')

  const [category, setCategory] = useState('all')

  const [collaboration, setCollaboration] = useState<
    'all' | 'solo' | 'collaborative'
  >('all')

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        articles
          .map((article) => article.category)
          .filter(Boolean),
      ),
    ) as string[]
  }, [articles])

  const drafts = useMemo(() => {
    return articles.filter(
      (article) =>
        article.status !== 'submitted',
    )
  }, [articles])

  const filteredDrafts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return drafts.filter((draft) => {
      const matchesSearch =
        !normalizedSearch ||
        draft.title.toLowerCase().includes(normalizedSearch) ||
        draft.excerpt
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        draft.category
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        draft.collaboration.coAuthors.some((collaborator) =>
          collaborator.name
            .toLowerCase()
            .includes(normalizedSearch),
        )

      const matchesStatus =
        status === 'all' || draft.status === status

      const matchesCategory =
        category === 'all' ||
        draft.category === category

      const coAuthorCount = draft.collaboration.coAuthors.length

      const matchesCollaboration =
        collaboration === 'all' ||
        (collaboration === 'solo' && coAuthorCount === 0) ||
        (collaboration === 'collaborative' &&
          coAuthorCount > 0)

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory &&
        matchesCollaboration
      )
    })
  }, [
    drafts,
    search,
    status,
    category,
    collaboration,
  ])

  const deleteDraft = (id: string) => {
    setArticles((current) =>
      current.filter((article) => article.id !== id),
    )
  }

  return {
    articles,
    drafts: filteredDrafts,

    search,
    setSearch,

    status,
    setStatus,

    category,
    setCategory,

    collaboration,
    setCollaboration,

    categories,

    deleteDraft,
  }
}

