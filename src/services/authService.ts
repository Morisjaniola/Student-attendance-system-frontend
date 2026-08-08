import type { AuthUser, LoginCredentials } from '../types/auth'

// Replace the mock implementation below with the PHP API client when the backend is ready.
const developmentAdministrator = {
  user: {
    id: 'admin-001',
    name: 'System Administrator',
    email: 'admin@attendance.com',
    role: 'Administrator',
  } satisfies AuthUser,
  password: 'admin123',
}

const delay = (milliseconds = 500) => new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds))

export const authService = {
  async login({ identifier, password }: LoginCredentials): Promise<AuthUser> {
    await delay()

    const isValidAdministrator =
      identifier.trim().toLowerCase() === developmentAdministrator.user.email &&
      password === developmentAdministrator.password

    if (!isValidAdministrator) {
      throw new Error('Invalid username or email, or password.')
    }

    return { ...developmentAdministrator.user }
  },
}
