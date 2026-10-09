export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  organizationName?: string
  // Role-agnostic profile data, shared by reader/author/editor so it carries across role changes.
  authorProfile?: { profileImage?: string; professionalName?: string; bio?: string }
  plan?: 'free' | 'premium'
  isEmailVerified?: boolean
  phone?: string
  isPhoneVerified?: boolean
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
}