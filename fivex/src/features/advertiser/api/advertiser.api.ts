import { apiClient } from '@/api/client'
import type { AdvertiserAccount, AdvertiserCredentials, AdvertiserRegistration } from '../types/advertiser.types'

// Advertisers have their own accounts and session (a separate cookie), served by /api/advertiser/auth.
// Nothing here touches the reader/author/editor/admin sign-in.
const BASE = '/api/advertiser/auth'

export const advertiserApi = {
  register: async (registration: AdvertiserRegistration): Promise<string> => {
    const { data } = await apiClient.post<{ message: string }>(`${BASE}/register`, registration)
    return data.message
  },

  login: async (credentials: AdvertiserCredentials): Promise<AdvertiserAccount> => {
    const { data } = await apiClient.post<{ advertiser: AdvertiserAccount }>(`${BASE}/login`, credentials)
    return data.advertiser
  },

  logout: async (): Promise<void> => {
    await apiClient.post(`${BASE}/logout`)
  },

  me: async (): Promise<AdvertiserAccount> => {
    const { data } = await apiClient.get<{ advertiser: AdvertiserAccount }>(`${BASE}/me`)
    return data.advertiser
  },

  verifyEmail: async (token: string): Promise<string> => {
    const { data } = await apiClient.post<{ message: string }>(`${BASE}/verify-email`, { token })
    return data.message
  },

  resendVerification: async (email: string): Promise<string> => {
    const { data } = await apiClient.post<{ message: string }>(`${BASE}/resend-verification`, { email })
    return data.message
  },

  forgotPassword: async (email: string): Promise<string> => {
    const { data } = await apiClient.post<{ message: string }>(`${BASE}/forgot-password`, { email })
    return data.message
  },

  resetPassword: async (token: string, password: string): Promise<string> => {
    const { data } = await apiClient.post<{ message: string }>(`${BASE}/reset-password`, { token, password })
    return data.message
  },
}
