import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation()
  const { isAuthenticated, user } = useAuthStore()

  // The current frontend phase authorizes Administrator accounts only.
  const isAuthorized = isAuthenticated && user?.role === 'Administrator'

  if (!isAuthorized) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}
