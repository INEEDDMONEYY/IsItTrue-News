import { apiClient } from '@/api/client'

export type WaitlistInterest = 'reader' | 'author' | 'editor' | 'organization'

export interface JoinWaitlistInput {
  email: string
  name?: string
  interest?: WaitlistInterest
}

export const prelaunchApi = {
  joinWaitlist: async (input: JoinWaitlistInput): Promise<void> => {
    await apiClient.post('/api/prelaunch/waitlist', input)
  },

  verifyAccessCode: async (code: string): Promise<void> => {
    await apiClient.post('/api/prelaunch/access', { code })
  },
}
