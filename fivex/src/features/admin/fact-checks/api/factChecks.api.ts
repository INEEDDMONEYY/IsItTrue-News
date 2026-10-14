import { apiClient } from '@/api/client'
import type {
  EscalationKind,
  FactCheckHistory,
  FactCheckList,
  FactCheckListParams,
  FactCheckOverview,
  FactCheckRecord,
  InvestigationOption,
  MetadataInput,
  Reviewer,
  RevisionInput,
} from '../types/factCheck.types'

const BASE = '/api/admin/fact-checks'

// Every action answers with the updated record, so the page can show the result without another request.
async function act(request: Promise<{ data: { record: FactCheckRecord } }>): Promise<FactCheckRecord> {
  const { data } = await request
  return data.record
}

export const factChecksApi = {
  overview: async (): Promise<FactCheckOverview> => (await apiClient.get<FactCheckOverview>(`${BASE}/overview`)).data,

  list: async (params: FactCheckListParams): Promise<FactCheckList> =>
    (await apiClient.get<FactCheckList>(BASE, { params })).data,

  get: async (id: string): Promise<FactCheckRecord> =>
    (await apiClient.get<{ record: FactCheckRecord }>(`${BASE}/${id}`)).data.record,

  history: async (id: string): Promise<FactCheckHistory> =>
    (await apiClient.get<FactCheckHistory>(`${BASE}/${id}/history`)).data,

  reviewers: async (): Promise<Reviewer[]> =>
    (await apiClient.get<{ reviewers: Reviewer[] }>(`${BASE}/reviewers`)).data.reviewers,

  investigations: async (): Promise<InvestigationOption[]> =>
    (await apiClient.get<{ investigations: InvestigationOption[] }>(`${BASE}/investigations`)).data.investigations,

  assign: (id: string, reviewerId: string, note?: string) =>
    act(apiClient.post(`${BASE}/${id}/assign`, { reviewerId, ...(note ? { note } : {}) })),
  unassign: (id: string, reason: string) => act(apiClient.post(`${BASE}/${id}/unassign`, { reason })),
  returnForReview: (id: string, reason: string) => act(apiClient.post(`${BASE}/${id}/return`, { reason })),
  escalate: (id: string, kind: EscalationKind, reason: string) =>
    act(apiClient.post(`${BASE}/${id}/escalate`, { kind, reason })),
  resolveEscalation: (id: string, note: string) => act(apiClient.post(`${BASE}/${id}/resolve-escalation`, { note })),
  flagEvidence: (id: string, reason: string) => act(apiClient.post(`${BASE}/${id}/evidence-flag`, { reason })),
  clearEvidenceFlag: (id: string, note?: string) =>
    act(apiClient.delete(`${BASE}/${id}/evidence-flag`, { data: note ? { note } : {} })),
  setEvidenceRestriction: (id: string, itemId: string, restricted: boolean, reason: string) =>
    act(apiClient.patch(`${BASE}/${id}/evidence/${itemId}/restriction`, { restricted, reason })),
  reviseAssessment: (id: string, input: RevisionInput) =>
    act(apiClient.post(`${BASE}/${id}/assessment-revision`, input)),
  correctMetadata: (id: string, input: MetadataInput) => act(apiClient.patch(`${BASE}/${id}/metadata`, input)),
  comment: (id: string, note: string) => act(apiClient.post(`${BASE}/${id}/comments`, { note })),
  linkInvestigation: (id: string, investigationId: string | null) =>
    act(apiClient.put(`${BASE}/${id}/investigation`, { investigationId })),
}
