export interface OnboardingSocialLinks {
  twitter?: string
  linkedin?: string
  instagram?: string
}

export interface BecomeAuthorPayload {
  fullName: string
  profilePhotoUrl?: string
  shortBio?: string
  socialLinks?: OnboardingSocialLinks
  acceptTruthProtocol: boolean
}

export interface BecomeEditorPayload {
  fullName: string
  profilePhotoUrl?: string
  shortBio?: string
  socialLinks?: OnboardingSocialLinks
  acceptEditorialStandards: boolean
}
