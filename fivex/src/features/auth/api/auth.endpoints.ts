export const AUTH_ENDPOINTS = {
  login: '/api/auth/login',
  register: '/api/auth/register',
  logout: '/api/auth/logout',
  me: '/api/auth/me',
  resendVerification: '/api/auth/resend-verification',
  forgotPassword: '/api/auth/forgot-password',
  resetPassword: '/api/auth/reset-password',
} as const