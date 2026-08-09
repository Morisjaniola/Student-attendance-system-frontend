import type { UserRole } from './auth'

/**
 * User Management module types (10. User Management).
 *
 * System users (Administrator / Faculty / Staff) are managed here — NOT
 * students (section 20). The UserRole type is reused from the existing
 * authentication structure so this module stays RBAC-ready.
 */

export type UserStatus = 'Active' | 'Inactive'

export interface SystemUser {
  id: string
  /** Full display name. */
  name: string
  username: string
  email: string
  role: UserRole
  status: UserStatus
  /** ISO timestamp of the last successful login, or null if never logged in. */
  lastLogin: string | null
  avatarColor: string
}

/** Search + filter state for the User Management page (sections 11, 12). */
export interface UserFilters {
  query: string
  role: UserRole | 'All'
  status: UserStatus | 'All'
}

export const EMPTY_USER_FILTERS: UserFilters = {
  query: '',
  role: 'All',
  status: 'All',
}

/** Editable account fields (create + update). No password field — ever. */
export interface UserFormValues {
  name: string
  username: string
  email: string
  role: UserRole
  status: UserStatus
}
