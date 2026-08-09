import { mockUsers } from '../data/userData'
import type { AuthUser, UserRole } from '../types/auth'
import type { SystemUser, UserFormValues, UserStatus } from '../types/user'

// ---------------------------------------------------------------------------
// User Management service (mock frontend implementation).
//
// Replace the in-memory store below with PHP API calls when the backend is
// ready; keep the same method signatures so the view layer does not change:
//
//   React  →  userService  →  PHP API  →  MySQL
//
// Passwords are never stored or returned (section 10.6): password reset is
// simulated only.
// ---------------------------------------------------------------------------

let users: SystemUser[] = [...mockUsers]

const delay = (milliseconds = 250) => new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds))

// ---------------------------------------------------------------------------
// Authorization (section 16 — RBAC-ready).
//
// Mirrors the role -> capability map used by the Attendance Records module and
// is structured so the backend can enforce the same permission names later:
//   users.view · users.create · users.update · users.activate ·
//   users.assignRole · users.resetPassword
// Frontend authorization is UI-level protection only until the PHP backend is
// implemented — it is never a security boundary.
// ---------------------------------------------------------------------------

export type UserManagementAction = 'users.view' | 'users.create' | 'users.update' | 'users.activate' | 'users.assignRole' | 'users.resetPassword'

const ROLE_CAPABILITIES: Record<UserRole, UserManagementAction[]> = {
  Administrator: ['users.view', 'users.create', 'users.update', 'users.activate', 'users.assignRole', 'users.resetPassword'],
  Faculty: ['users.view'],
  Staff: ['users.view'],
}

export function canPerformUserAction(user: AuthUser | null, action: UserManagementAction): boolean {
  return Boolean(user && ROLE_CAPABILITIES[user.role]?.includes(action))
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const VALID_ROLES: UserRole[] = ['Administrator', 'Faculty', 'Staff']
const VALID_STATUSES: UserStatus[] = ['Active', 'Inactive']
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateUser(values: UserFormValues, excludingId?: string): string | null {
  if (!values.name.trim()) return 'Full name is required.'
  if (!values.username.trim()) return 'Username is required.'
  if (!values.email.trim()) return 'Email is required.'
  if (!EMAIL_PATTERN.test(values.email.trim())) return 'Enter a valid email address.'
  if (!VALID_ROLES.includes(values.role)) return 'Select a valid role.'
  if (!VALID_STATUSES.includes(values.status)) return 'Select a valid status.'

  const username = values.username.trim().toLowerCase()
  const email = values.email.trim().toLowerCase()
  const duplicate = users.find((user) => user.id !== excludingId && (user.username.toLowerCase() === username || user.email.toLowerCase() === email))
  if (duplicate) {
    return duplicate.username.toLowerCase() === username ? `Username "${values.username.trim()}" is already taken.` : `Email "${values.email.trim()}" is already in use.`
  }
  return null
}

/** '2026-08-09T09:15:00' -> 'Aug 9, 2026 · 09:15 AM'; null -> 'Never'. */
export function formatLastLogin(lastLogin: string | null): string {
  if (!lastLogin) return 'Never'
  const date = new Date(lastLogin)
  if (Number.isNaN(date.getTime())) return 'Never'
  const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const timeLabel = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${dateLabel} · ${timeLabel}`
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export const userService = {
  async list(): Promise<SystemUser[]> {
    await delay()
    return users.map((user) => ({ ...user }))
  },

  /** Creates a new account (requirement 10.2). Throws on invalid/duplicate data. */
  async create(values: UserFormValues): Promise<SystemUser> {
    await delay()
    const error = validateUser(values)
    if (error) throw new Error(error)

    const sequence = String(users.length + 1).padStart(3, '0')
    const newUser: SystemUser = {
      id: `USR-${sequence}`,
      name: values.name.trim(),
      username: values.username.trim(),
      email: values.email.trim(),
      role: values.role,
      status: values.status,
      lastLogin: null,
      avatarColor: 'bg-blue-100 text-blue-700',
    }
    users = [...users, newUser]
    return { ...newUser }
  },

  /** Updates an account (requirement 10.3). Throws on invalid/duplicate data. */
  async update(id: string, values: UserFormValues): Promise<SystemUser> {
    await delay()
    const current = users.find((user) => user.id === id)
    if (!current) throw new Error('User account not found.')

    const error = validateUser(values, id)
    if (error) throw new Error(error)

    const updated: SystemUser = {
      ...current,
      name: values.name.trim(),
      username: values.username.trim(),
      email: values.email.trim(),
      role: values.role,
      status: values.status,
    }
    users = users.map((user) => (user.id === id ? updated : user))
    return { ...updated }
  },

  /** Activates or deactivates an account (requirement 10.4). Never deletes it. */
  async setStatus(id: string, status: UserStatus): Promise<SystemUser> {
    await delay()
    const current = users.find((user) => user.id === id)
    if (!current) throw new Error('User account not found.')
    const updated: SystemUser = { ...current, status }
    users = users.map((user) => (user.id === id ? updated : user))
    return { ...updated }
  },

  /** Assigns a role (requirement 10.5). */
  async assignRole(id: string, role: UserRole): Promise<SystemUser> {
    await delay()
    const current = users.find((user) => user.id === id)
    if (!current) throw new Error('User account not found.')
    if (!VALID_ROLES.includes(role)) throw new Error('Select a valid role.')
    const updated: SystemUser = { ...current, role }
    users = users.map((user) => (user.id === id ? updated : user))
    return { ...updated }
  },

  /** Simulates a password reset (requirement 10.6). Never returns a password. */
  async resetPassword(id: string): Promise<void> {
    await delay()
    if (!users.some((user) => user.id === id)) throw new Error('User account not found.')
    // The real reset (secure token + email link) happens in the PHP backend.
  },
}
