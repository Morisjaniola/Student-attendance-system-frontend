import type { AuthUser, LoginCredentials } from '../types/auth'

// Replace the mock implementation below with the PHP API client when the backend is ready.
//
// These are DEVELOPMENT-ONLY demo credentials that mirror the mock users in
// data/userData.ts. Passwords are in-memory constants for the mock login only —
// they are never persisted, stored, or exposed, and the real backend will handle
// authentication and password hashing later.
const demoAccounts = [
  {
    user: {
      id: 'admin-001',
      name: 'System Administrator',
      email: 'admin@attendance.com',
      role: 'Administrator',
    } satisfies AuthUser,
    password: 'admin123',
  },
  {
    user: {
      id: 'fac-001',
      name: 'Andrea Reyes',
      email: 'andrea.reyes@attendance.edu',
      role: 'Faculty',
    } satisfies AuthUser,
    password: 'faculty123',
  },
  {
    user: {
      id: 'stf-001',
      name: 'Camille Flores',
      email: 'camille.flores@attendance.edu',
      role: 'Staff',
    } satisfies AuthUser,
    password: 'staff123',
  },
]

const delay = (milliseconds = 500) => new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds))

export const authService = {
  async login({ identifier, password }: LoginCredentials): Promise<AuthUser> {
    await delay()

    const normalizedIdentifier = identifier.trim().toLowerCase()
    // Accepts the email, the short username (the part before @), or the display
    // name so the "Username or Email" field behaves as its label promises.
    const account = demoAccounts.find(({ user, password: accountPassword }) => {
      const username = user.email.split('@')[0]
      return (
        (normalizedIdentifier === user.email || normalizedIdentifier === username || normalizedIdentifier === user.name.toLowerCase()) &&
        password === accountPassword
      )
    })

    if (!account) {
      throw new Error('Invalid username or email, or password.')
    }

    return { ...account.user }
  },
}
