export type UserRole = 'Administrator' | 'Faculty' | 'Staff'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface LoginCredentials {
  identifier: string
  password: string
}
