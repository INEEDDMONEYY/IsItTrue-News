import { apiClient } from '@/api/client'
import type { AuthUser } from '@/features/auth/types/auth.types'
import type { BecomeAuthorPayload } from '../types/onboarding.types'

export const onboardingApi = {
  sendPhoneCode: (phone: string) =>
    apiClient.post<{ message: string }>('/api/users/me/phone/send-code', { phone }),
  verifyPhoneCode: (code: string) =>
    apiClient.post<{ message: string; user: AuthUser }>('/api/users/me/phone/verify', { code }),
  becomeAuthor: (payload: BecomeAuthorPayload) =>
    apiClient.post<{ message: string; user: AuthUser }>('/api/users/me/become-author', payload),
}
