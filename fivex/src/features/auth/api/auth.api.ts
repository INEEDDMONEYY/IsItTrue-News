import { apiClient } from '@/api/client'
import { AUTH_ENDPOINTS } from './auth.endpoints'
import type { LoginPayload, LoginResponse } from '../types/login.types'
import type { RegisterPayload, RegisterResponse } from '../types/register.types'
import type { AuthUser } from '../types/auth.types'

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<LoginResponse>(AUTH_ENDPOINTS.login, payload),
  register: (payload: RegisterPayload) =>
    apiClient.post<RegisterResponse>(AUTH_ENDPOINTS.register, payload),
  logout: () => apiClient.post<{ message: string }>(AUTH_ENDPOINTS.logout),
  me: () => apiClient.get<{ user: AuthUser }>(AUTH_ENDPOINTS.me),
  resendVerification: (email: string) =>
    apiClient.post<{ message: string }>(AUTH_ENDPOINTS.resendVerification, { email }),
}