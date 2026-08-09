import { create } from 'zustand'
import { authService } from '../services/authService'
import type { AuthUser, LoginCredentials } from '../types/auth'

const AUTH_STORAGE_KEY = 'attendance_auth'
const AUTH_STORAGE_KEYS = [AUTH_STORAGE_KEY]

interface StoredAuthSession {
  user: AuthUser
}

interface AuthStore {
  isAuthenticated: boolean
  user: AuthUser | null
  login: (credentials: LoginCredentials, rememberMe: boolean) => Promise<AuthUser>
  logout: () => void
}

function readStoredSession(): AuthUser | null {
  if (typeof window === 'undefined') return null

  try {
    const storedValue = window.localStorage.getItem(AUTH_STORAGE_KEY)
    if (!storedValue) return null

    const session = JSON.parse(storedValue) as StoredAuthSession
    if (!session.user?.id || !session.user.name || !session.user.email || !session.user.role) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY)
      return null
    }

    return session.user
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

const storedUser = readStoredSession()

function clearAuthenticationStorage() {
  if (typeof window === 'undefined') return
  // Keep settings, theme, language, and all unrelated application data intact.
  AUTH_STORAGE_KEYS.forEach((key) => {
    window.localStorage.removeItem(key)
    window.sessionStorage.removeItem(key)
  })
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: Boolean(storedUser),
  user: storedUser,
  login: async (credentials, rememberMe) => {
    const user = await authService.login(credentials)

    if (rememberMe) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user } satisfies StoredAuthSession))
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY)
    }

    set({ isAuthenticated: true, user })
    return user
  },
  logout: () => {
    clearAuthenticationStorage()
    set({ isAuthenticated: false, user: null })
  },
}))
