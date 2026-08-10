import { apiClient } from '@/api/client'
import type { AdminUser, CreateUserPayload, UserRole } from '../types/user.types'

export const adminApi = {
  listUsers: () => apiClient.get<{ users: AdminUser[] }>('/api/users'),

  createUser: (payload: CreateUserPayload) =>
    apiClient.post<{ message: string; user: AdminUser }>('/api/users', payload),

  updateUserRole: (userId: string, role: UserRole) =>
    apiClient.patch<{ message: string }>(`/api/users/${userId}/role`, { role }),

  deleteUser: (userId: string) => apiClient.delete<{ message: string }>(`/api/users/${userId}`),
}
