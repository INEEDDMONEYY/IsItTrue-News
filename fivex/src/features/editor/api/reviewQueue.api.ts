import { apiClient } from '@/api/client'
import type { PendingArticle } from '../types/reviewQueue.types'

export const reviewQueueApi = {
  listPending: async (): Promise<PendingArticle[]> => {
    const { data } = await apiClient.get<{ articles: PendingArticle[] }>('/api/articles/pending')
    return data.articles
  },

  approve: async (id: string): Promise<void> => {
    await apiClient.post(`/api/articles/${id}/approve`)
  },

  // Sends the article back to its author with a checklist of requirements and/or a note.
  requestChanges: async (id: string, input: { requirements: string[]; note?: string }): Promise<void> => {
    await apiClient.post(`/api/articles/${id}/request-changes`, input)
  },

  // Drafts returned to their authors that haven't been resubmitted yet.
  listChangesRequested: async (): Promise<PendingArticle[]> => {
    const { data } = await apiClient.get<{ articles: PendingArticle[] }>('/api/articles/changes-requested')
    return data.articles
  },
}
