import { settingsApi, type ChangeEmailPayload, type ChangePasswordPayload, type UpdateNamePayload } from '../api/settings.api'

export const settingsService = {
  async updateName(payload: UpdateNamePayload) {
    const response = await settingsApi.updateName(payload)
    return response.data.user
  },

  async changeEmail(payload: ChangeEmailPayload) {
    const response = await settingsApi.changeEmail(payload)
    return response.data.user
  },

  async changePassword(payload: ChangePasswordPayload) {
    await settingsApi.changePassword(payload)
  },

  async deleteOwnAccount() {
    await settingsApi.deleteOwnAccount()
  },
}
