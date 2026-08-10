export type FactCheckRequestStatus = 'pending' | 'approved' | 'rejected'

export interface FactCheckArticleRef {
  id: string
  title: string
  slug: string
  status: string
  factCheckStatus: 'none' | 'pending' | 'approved' | 'rejected'
}

export interface FactCheckUserRef {
  id: string
  name: string
  email: string
  role: string
}

export interface FactCheckRequest {
  id: string
  claim: string
  sources: string
  notes: string
  status: FactCheckRequestStatus
  rejectionReason?: string
  reviewedAt?: string
  createdAt: string
  article: FactCheckArticleRef
  requestedBy: FactCheckUserRef
  reviewedBy?: FactCheckUserRef
}

export interface CreateFactCheckRequestInput {
  articleId: string
  claim: string
  sources: string
  notes: string
}
