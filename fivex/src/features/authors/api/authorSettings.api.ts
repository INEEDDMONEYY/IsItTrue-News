import { apiClient } from '@/api/client'

// Mirrors backend/modules/users/models/User.ts's IAuthorProfile — a flat
// sub-document on the User model, unlike the frontend's nested
// profile/expertise/publishing/preferences grouping (see authorSettings.types.ts).
export interface AuthorProfileApi {
  professionalName?: string
  bio?: string
  location?: string
  website?: string
  profileImage?: string
  bannerImage?: string
  socialLinks?: {
    twitter?: string
    linkedin?: string
    instagram?: string
  }
  primaryBeats?: string[]
  secondaryBeats?: string[]
  areasOfExpertise?: string[]
  geographicCoverage?: string[]
  languages?: string[]
  yearsOfExperience?: number
  defaultCategory?: string
  defaultVisibility?: 'draft' | 'editorial-review'
  factCheckingEnabled?: boolean
  sourceAttributionEnabled?: boolean
  allowEditorialSuggestions?: boolean
  editorialUpdates?: boolean
  assignmentNotifications?: boolean
  revisionNotifications?: boolean
  collaborationNotifications?: boolean
  investigationNotifications?: boolean
}

export const authorSettingsApi = {
  // /api/auth/me returns the full signed-in user, which includes
  // authorProfile — there's no need for a separate GET endpoint.
  getMine: async (): Promise<{ name: string; role: string; authorProfile: AuthorProfileApi }> => {
    const { data } = await apiClient.get<{
      user: { name: string; role: string; authorProfile?: AuthorProfileApi }
    }>('/api/auth/me')

    return {
      name: data.user.name,
      role: data.user.role,
      authorProfile: data.user.authorProfile ?? {},
    }
  },

  updateProfile: async (updates: Partial<AuthorProfileApi>): Promise<void> => {
    await apiClient.patch('/api/users/me/author-profile', updates)
  },

  updateName: async (name: string): Promise<void> => {
    await apiClient.patch('/api/users/me', { name })
  },
}
