export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
}