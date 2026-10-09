import { apiClient } from '@/api/client'
import type {
  ArticleEditorialStage,
  ArticleWorkflowItem,
  InvestigationWorkflowItem,
  InvestigationWorkflowStage,
} from '../types/calendar.types'

export const editorialCalendarApi = {
  listArticles: async (): Promise<ArticleWorkflowItem[]> => {
    const { data } = await apiClient.get<{ articles: ArticleWorkflowItem[] }>(
      '/api/articles/editorial-workflow',
    )
    return data.articles
  },

  listInvestigations: async (): Promise<InvestigationWorkflowItem[]> => {
    const { data } = await apiClient.get<{ investigations: InvestigationWorkflowItem[] }>(
      '/api/investigations/editorial-workflow',
    )
    return data.investigations
  },

  updateArticle: async (
    id: string,
    workflow: { editorialStage: ArticleEditorialStage; editorialDeadline: string | null },
  ): Promise<void> => {
    await apiClient.patch(`/api/articles/${id}/editorial-workflow`, workflow)
  },

  updateInvestigation: async (
    id: string,
    workflow: { workflowStage: InvestigationWorkflowStage; editorialDeadline: string | null },
  ): Promise<void> => {
    await apiClient.patch(`/api/investigations/${id}/editorial-workflow`, workflow)
  },
}
