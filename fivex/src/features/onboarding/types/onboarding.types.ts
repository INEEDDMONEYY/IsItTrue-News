export interface OnboardingSocialLinks {
  twitter?: string
  linkedin?: string
  instagram?: string
}

export interface BecomeAuthorPayload {
  fullName: string
  profilePhotoUrl: string
  shortBio: string
  socialLinks?: OnboardingSocialLinks
  acceptTruthProtocol: boolean
}
