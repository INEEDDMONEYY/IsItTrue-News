
export type VerificationStatus =
  | 'verified'
  | 'pending'
  | 'action_required'
  | 'not_started'

export type VerificationDocumentStatus =
  | 'verified'
  | 'pending'
  | 'rejected'
  | 'expired'

export type VerificationDocumentType =
  | 'government_id'
  | 'proof_of_address'
  | 'professional_credentials'
  | 'other'

export interface ProfileIdentity {
  id: string
  displayName: string
  username: string
  email: string
  avatarUrl?: string
  bio?: string
  location?: string
  joinedAt: string
  role: 'author'
  profileCompletion: number
  verificationStatus: VerificationStatus
  verificationLevel: string
  verifiedAt?: string
}

export interface VerificationDocument {
  id: string
  type: VerificationDocumentType
  name: string
  status: VerificationDocumentStatus
  submittedAt?: string
  reviewedAt?: string
  expiresAt?: string
  note?: string
}

export interface VerificationEvent {
  id: string
  title: string
  description: string
  date: string
  status: 'completed' | 'pending' | 'action_required'
}

export interface ProfileIdentityData {
  profile: ProfileIdentity
  documents: VerificationDocument[]
  timeline: VerificationEvent[]
}

