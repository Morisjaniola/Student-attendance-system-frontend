import type { AuthUser, LoginCredentials } from '../types/auth'
import { userService } from './userService'

// Replace the mock implementation below with the PHP API client when the backend is ready.
const delay = (milliseconds = 500) => new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds))

// Development-only mock password digests. Account identity, role, and active
// status always come from the existing User Management data, not a duplicate
// authentication user list. Replace this mock verification with the backend
// credential endpoint when it is available.
const DEVELOPMENT_PASSWORD_DIGESTS = {
  Administrator: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
  Faculty: '27041f5856c7387a997252694afb048d1aa939228ffcdbd6285b979b8da20e7a',
  Staff: '10176e7b7b24d317acfcf8d2064cfd2f24e154f7b5a96603077d5ef813d6a6b6',
} as const

async function passwordDigest(password: string) {
  const encoded = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, '0')).join('')
}

export const authService = {
  async login({ identifier, password }: LoginCredentials): Promise<AuthUser> {
    await delay()

    const normalizedIdentifier = identifier.trim().toLowerCase()
    const users = await userService.list()
    const account = users.find((user) =>
      [user.email, user.username, user.name].some((value) => value.toLowerCase() === normalizedIdentifier),
    )

    if (!account || !(await passwordDigest(password) === DEVELOPMENT_PASSWORD_DIGESTS[account.role])) {
      throw new Error('Invalid username or email, or password.')
    }

    if (account.status !== 'Active') {
      throw new Error('This account is inactive. Please contact an administrator.')
    }

    return { id: account.id, name: account.name, email: account.email, role: account.role }
  },
}
