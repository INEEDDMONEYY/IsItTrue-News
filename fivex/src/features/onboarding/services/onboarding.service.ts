import { onboardingApi } from '../api/onboarding.api'
import type { BecomeAuthorPayload } from '../types/onboarding.types'

export const onboardingService = {
  async sendPhoneCode(phone: string) {
    const response = await onboardingApi.sendPhoneCode(phone)
    return response.data
  },

  async verifyPhoneCode(code: string) {
    const response = await onboardingApi.verifyPhoneCode(code)
    return response.data
  },

  async becomeAuthor(payload: BecomeAuthorPayload) {
    const response = await onboardingApi.becomeAuthor(payload)
    return response.data
  },
}
