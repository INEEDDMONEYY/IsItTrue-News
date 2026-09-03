import { apiClient } from '@/api/client'

// Mirrors backend/modules/users/models/User.ts's IReaderProfile — a flat
// sub-document on the User model (see authorSettings.api.ts for the same
// pattern used on the author side).
export interface ReaderProfileApi {
  fontSize?: 'small' | 'medium' | 'large'
  theme?: 'light' | 'dark' | 'sepia'
  distractionFreeMode?: boolean
  autoSaveProgress?: boolean
  showEstimatedReadingTime?: boolean
  summariesFirst?: boolean
  topics?: string[]
  regions?: string[]
  formats?: string[]
  depth?: 'quick-summaries' | 'full-investigative'
}

export const readerSettingsApi = {
  // /api/auth/me returns the full signed-in user, which includes
  // readerProfile — there's no need for a separate GET endpoint.
  getMine: async (): Promise<{ readerProfile: ReaderProfileApi }> => {
    const { data } = await apiClient.get<{
      user: { readerProfile?: ReaderProfileApi }
    }>('/api/auth/me')

    return {
      readerProfile: data.user.readerProfile ?? {},
    }
  },

  updateProfile: async (updates: Partial<ReaderProfileApi>): Promise<void> => {
    await apiClient.patch('/api/users/me/reader-profile', updates)
  },
}
