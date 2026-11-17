import { apiClient } from '@/api/client'
import type {
  ArticleWorkflowItem,
  EditorAccount,
  EditorSettableArticleStage,
  InvestigationWorkflowItem,
  InvestigationWorkflowStage,
} from '../types/calendar.types'

export const editorialCalendarApi = {
  listEditors: async (): Promise<EditorAccount[]> => {
    const { data } = await apiClient.get<{ editors: EditorAccount[] }>('/api/users/editors')
    return data.editors
  },

  assignArticle: async (id: string, assigneeId: string | null): Promise<void> => {
    await apiClient.patch(`/api/articles/${id}/assignee`, { assigneeId })
  },

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
    workflow: { editorialStage: EditorSettableArticleStage },
  ): Promise<void> => {
    await apiClient.patch(`/api/articles/${id}/editorial-workflow`, workflow)
  },

  updateInvestigation: async (
    id: string,
    workflow: { workflowStage: InvestigationWorkflowStage },
  ): Promise<void> => {
    await apiClient.patch(`/api/investigations/${id}/editorial-workflow`, workflow)
  },
}
