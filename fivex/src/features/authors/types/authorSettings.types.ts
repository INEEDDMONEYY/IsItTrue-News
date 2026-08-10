export interface AuthorProfileSettings {
  displayName: string
  professionalName: string
  bio: string
  location: string
  website: string
  profileImage?: string
  socialLinks: {
    twitter: string
    linkedin: string
    instagram: string
  }
}

export interface AuthorExpertiseSettings {
  primaryBeats: string[]
  secondaryBeats: string[]
  areasOfExpertise: string[]
  geographicCoverage: string[]
  languages: string[]
  yearsOfExperience: number
}

export interface AuthorPublishingSettings {
  defaultCategory: string
  defaultVisibility: 'draft' | 'editorial-review'
  factCheckingEnabled: boolean
  sourceAttributionEnabled: boolean
  allowEditorialSuggestions: boolean
}

export interface AuthorNotificationPreferences {
  editorialUpdates: boolean
  assignmentNotifications: boolean
  revisionNotifications: boolean
  collaborationNotifications: boolean
  investigationNotifications: boolean
}

export interface AuthorStatus {
  status: 'active' | 'inactive' | 'under-review'
  editorialStatus: 'good-standing' | 'review' | 'restricted'
  factCheckAccess: boolean
  investigationAccess: boolean
}

export interface AuthorSettings {
  profile: AuthorProfileSettings
  expertise: AuthorExpertiseSettings
  publishing: AuthorPublishingSettings
  preferences: AuthorNotificationPreferences
  status: AuthorStatus
}