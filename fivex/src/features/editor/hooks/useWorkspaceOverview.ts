import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { investigationWorkspaceApi } from '@/features/authors/api/investigations.api'
import { editorialCalendarApi } from '../api/calendar.api'
import { claimsApi } from '../api/claims.api'

const REFRESH_MS = 60_000
export const OVERVIEW_KEY = ['editor', 'workspace-overview'] as const

export function useWorkspaceOverview() {
  const articles = useQuery({
    queryKey: [...OVERVIEW_KEY, 'articles'],
    queryFn: editorialCalendarApi.listArticles,
    refetchInterval: REFRESH_MS,
  })
  const investigations = useQuery({
    queryKey: [...OVERVIEW_KEY, 'investigations'],
    queryFn: editorialCalendarApi.listInvestigations,
    refetchInterval: REFRESH_MS,
  })
  const myInvestigations = useQuery({
    queryKey: [...OVERVIEW_KEY, 'my-investigations'],
    queryFn: investigationWorkspaceApi.listMine,
    refetchInterval: REFRESH_MS,
  })
  const claims = useQuery({
    queryKey: [...OVERVIEW_KEY, 'claims'],
    queryFn: claimsApi.list,
    refetchInterval: REFRESH_MS,
  })
  const factCheckArticles = useQuery({
    queryKey: [...OVERVIEW_KEY, 'fact-check-articles'],
    queryFn: claimsApi.listArticles,
    refetchInterval: REFRESH_MS,
  })

  const sources = { articles, investigations, myInvestigations, claims, factCheckArticles }

  const myInvestigationIds = useMemo(
    () =>
      myInvestigations.data
        ? new Set(myInvestigations.data.map((investigation) => investigation.id))
        : undefined,
    [myInvestigations.data],
  )

  return {
    sources,
    articles: articles.data,
    investigations: investigations.data,
    myInvestigationIds,
    claims: claims.data,
    factCheckArticles: factCheckArticles.data,
  }
}
