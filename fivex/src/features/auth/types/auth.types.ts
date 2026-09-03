export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  plan?: 'free' | 'premium'
  isEmailVerified?: boolean
  phone?: string
  isPhoneVerified?: boolean
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
}