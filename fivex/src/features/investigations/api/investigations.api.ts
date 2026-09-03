import { apiClient } from '@/api/client'
import type {
  GetInvestigationResponse,
  PublicInvestigationSummary,
} from '../types/investigation.types'

/**
 * Public, reader-facing investigation endpoints — backed by the real
 * /api/investigations routes. Listing and detail are readable by anyone;
 * comment/bookmark/follow require the caller to be signed in.
 */
export const investigationsApi = {
  listPublished: async (category?: string): Promise<PublicInvestigationSummary[]> => {
    const { data } = await apiClient.get<{ investigations: PublicInvestigationSummary[] }>(
      '/api/investigations',
      { params: category ? { category } : undefined },
    )
    return data.investigations
  },

  getById: async (id: string): Promise<GetInvestigationResponse> => {
    const { data } = await apiClient.get<GetInvestigationResponse>(`/api/investigations/${id}`)
    return data
  },

  addComment: async (id: string, content: string): Promise<void> => {
    await apiClient.post(`/api/investigations/${id}/comments`, { content })
  },

  toggleBookmark: async (id: string): Promise<{ bookmarked: boolean; bookmarksCount: number }> => {
    const { data } = await apiClient.post<{ bookmarked: boolean; bookmarksCount: number }>(
      `/api/investigations/${id}/bookmark`,
    )
    return data
  },

  toggleFollow: async (id: string): Promise<{ following: boolean; followersCount: number }> => {
    const { data } = await apiClient.post<{ following: boolean; followersCount: number }>(
      `/api/investigations/${id}/follow`,
    )
    return data
  },
}
