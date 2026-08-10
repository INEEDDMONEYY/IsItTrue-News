import { authApi } from '../api/auth.api'
import type { LoginPayload } from '../types/login.types'

export const authService = {
  async login(payload: LoginPayload) {
    const response = await authApi.login(payload)
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
}