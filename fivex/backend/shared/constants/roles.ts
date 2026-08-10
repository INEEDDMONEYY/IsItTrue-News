export const ROLES = {
  READER: 'reader',
  AUTHOR: 'author',
  EDITOR: 'editor',
  ADMIN: 'admin',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ALL_ROLES: Role[] = Object.values(ROLES)
