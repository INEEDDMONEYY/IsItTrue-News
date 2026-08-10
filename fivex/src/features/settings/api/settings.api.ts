import { apiClient } from '@/api/client'
import type { AuthUser } from '@/features/auth/types/auth.types'

export interface UpdateNamePayload {
  name: string
}

export interface ChangeEmailPayload {
  newEmail: string
  currentPassword: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export const settingsApi = {
  updateName: (payload: UpdateNamePayload) =>
    apiClient.patch<{ message: string; user: AuthUser }>('/api/users/me', payload),

  changeEmail: (payload: ChangeEmailPayload) =>
    apiClient.patch<{ message: string; user: AuthUser }>('/api/users/me/email', payload),

  changePassword: (payload: ChangePasswordPayload) =>
    apiClient.patch<{ message: string }>('/api/users/me/password', payload),

  deleteOwnAccount: () => apiClient.delete<{ message: string }>('/api/users/me'),
}
