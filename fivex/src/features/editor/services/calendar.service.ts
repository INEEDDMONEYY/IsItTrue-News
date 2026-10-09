import { editorialCalendarApi } from '../api/calendar.api'
import type {
  EditorialCalendarItem,
  EditorialWorkflowUpdate,
} from '../types/calendar.types'

export const editorialCalendarService = {
  async listWorkflowItems(): Promise<EditorialCalendarItem[]> {
    const [articles, investigations] = await Promise.all([
      editorialCalendarApi.listArticles(),
      editorialCalendarApi.listInvestigations(),
    ])

    return [
      ...articles.map((article) => ({ ...article, kind: 'article' as const })),
      ...investigations.map((investigation) => ({ ...investigation, kind: 'investigation' as const })),
    ]
  },

  async updateWorkflowItem(workflow: EditorialWorkflowUpdate): Promise<void> {
    if (workflow.kind === 'article') {
      await editorialCalendarApi.updateArticle(workflow.id, {
        editorialStage: workflow.stage,
        editorialDeadline: workflow.deadline,
      })
      return
    }

    await editorialCalendarApi.updateInvestigation(workflow.id, {
      workflowStage: workflow.stage,
      editorialDeadline: workflow.deadline,
    })
  },
}
