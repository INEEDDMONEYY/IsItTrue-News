export const ROLES = {
  READER: 'reader',
  AUTHOR: 'author',
  EDITOR: 'editor',
  ORGANIZATION: 'organization',
  CONTRIBUTOR: 'contributor',
  ADMIN: 'admin',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ALL_ROLES: Role[] = Object.values(ROLES)
