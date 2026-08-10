import { adminApi } from '../api/admin.api'
import type { CreateUserPayload, UserRole } from '../types/user.types'

export const adminService = {
  async listUsers() {
    const response = await adminApi.listUsers()
    return response.data.users
  },

  async createUser(payload: CreateUserPayload) {
    const response = await adminApi.createUser(payload)
    return response.data.user
  },

  async updateUserRole(userId: string, role: UserRole) {
    await adminApi.updateUserRole(userId, role)
  },

  async deleteUser(userId: string) {
    await adminApi.deleteUser(userId)
  },
}
