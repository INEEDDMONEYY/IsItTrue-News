import { authApi } from '../api/auth.api'
import type { LoginPayload } from '../types/login.types'
import type { RegisterPayload } from '../types/register.types'

export const authService = {
  async login(payload: LoginPayload) {
    const response = await authApi.login(payload)
    return response.data
  },

  async register(payload: RegisterPayload) {
    const response = await authApi.register(payload)
    return response.data
  },

  async logout() {
    const response = await authApi.logout()
    return response.data
  },

  async getCurrentUser() {
    const response = await authApi.me()
    return response.data.user
  },

  async resendVerification(email: string) {
    const response = await authApi.resendVerification(email)
    return response.data
  },
}