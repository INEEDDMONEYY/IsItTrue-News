import { apiClient } from '@/api/client'
import type {
  AddTimelineEntryInput,
  CreateInvestigationInput,
  GetInvestigationResponse,
  UpdateInvestigationInput,
  WorkspaceInvestigation,
} from '@/features/investigations/types/investigation.types'

/**
 * Author/editor/admin-only Investigation Workspace endpoints — backed by
 * the real /api/investigations routes. Never exposed to plain readers;
 * every call here requires an authenticated author/editor/admin session
 * (enforced server-side, this is just the client wiring).
 */
export const investigationWorkspaceApi = {
  listMine: async (): Promise<WorkspaceInvestigation[]> => {
    const { data } = await apiClient.get<{ investigations: WorkspaceInvestigation[] }>(
      '/api/investigations/mine',
    )
    return data.investigations
  },

  listReviewQueue: async (): Promise<WorkspaceInvestigation[]> => {
    const { data } = await apiClient.get<{ investigations: WorkspaceInvestigation[] }>(
      '/api/investigations/review-queue',
    )
    return data.investigations
  },

  getById: async (id: string): Promise<GetInvestigationResponse> => {
    const { data } = await apiClient.get<GetInvestigationResponse>(`/api/investigations/${id}`)
    return data
  },

  create: async (input: CreateInvestigationInput): Promise<WorkspaceInvestigation> => {
    const { data } = await apiClient.post<{ investigation: WorkspaceInvestigation }>(
      '/api/investigations',
      input,
    )
    return data.investigation
  },

  update: async (id: string, input: UpdateInvestigationInput): Promise<void> => {
    await apiClient.patch(`/api/investigations/${id}`, input)
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/investigations/${id}`)
  },

  submitForReview: async (id: string): Promise<void> => {
    await apiClient.post(`/api/investigations/${id}/submit`)
  },

  publish: async (id: string): Promise<void> => {
    await apiClient.post(`/api/investigations/${id}/publish`)
  },

  reject: async (id: string, reason: string): Promise<void> => {
    await apiClient.post(`/api/investigations/${id}/reject`, { reason })
  },

  addTimelineEntry: async (id: string, input: AddTimelineEntryInput): Promise<void> => {
    await apiClient.post(`/api/investigations/${id}/timeline`, input)
  },

  removeTimelineEntry: async (id: string, entryId: string): Promise<void> => {
    await apiClient.delete(`/api/investigations/${id}/timeline/${entryId}`)
  },

  addEditorComment: async (id: string, message: string): Promise<void> => {
    await apiClient.post(`/api/investigations/${id}/editor-comments`, { message })
  },
}
