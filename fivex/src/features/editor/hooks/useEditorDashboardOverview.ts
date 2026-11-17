import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/app/providers/AuthProvider'
import { editorialCalendarApi } from '../api/calendar.api'
import { OVERVIEW_KEY, useWorkspaceOverview } from './useWorkspaceOverview'
import { buildWorkItems, type WorkItem, type WorkspaceSnapshot } from '../utils/workspaceOverview'

const NOW_REFRESH_MS = 60_000

export function useEditorDashboardOverview() {
  const { user } = useAuth()
  const workspace = useWorkspaceOverview()
  const queryClient = useQueryClient()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), NOW_REFRESH_MS)
    return () => clearInterval(timer)
  }, [])

  const editors = useQuery({
    queryKey: [...OVERVIEW_KEY, 'editors'],
    queryFn: editorialCalendarApi.listEditors,
  })

  const assign = useMutation({
    mutationFn: ({ articleId, assigneeId }: { articleId: string; assigneeId: string | null }) =>
      editorialCalendarApi.assignArticle(articleId, assigneeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: OVERVIEW_KEY }),
  })

  const items = useMemo<WorkItem[] | null>(() => {
    if (
      !user ||
      !workspace.articles ||
      !workspace.investigations ||
      !workspace.myInvestigationIds ||
      !workspace.claims ||
      !workspace.factCheckArticles
    ) {
      return null
    }
    const snapshot: WorkspaceSnapshot = {
      userId: user.id,
      now,
      articles: workspace.articles,
      investigations: workspace.investigations,
      myInvestigationIds: workspace.myInvestigationIds,
      claims: workspace.claims,
      factCheckArticles: workspace.factCheckArticles,
    }
    return buildWorkItems(snapshot)
  }, [user, now, workspace.articles, workspace.investigations, workspace.myInvestigationIds, workspace.claims, workspace.factCheckArticles])

  const sources = { ...workspace.sources, editors }

  return { workspace, sources, items, now, editors, assign }
}
