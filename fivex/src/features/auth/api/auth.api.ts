import { apiClient } from '@/api/client'
import { AUTH_ENDPOINTS } from './auth.endpoints'
import type { LoginPayload, LoginResponse } from '../types/login.types'
import type { AuthUser } from '../types/auth.types'

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<LoginResponse>(AUTH_ENDPOINTS.login, payload),
  logout: () => apiClient.post<{ message: string }>(AUTH_ENDPOINTS.logout),
  me: () => apiClient.get<{ user: AuthUser }>(AUTH_ENDPOINTS.me),
}