import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { AccessDenied } from '../roles/AccessDenied'
import { hasPermission } from '../../services/roleService'
import { useRoleStore } from '../../stores/roleStore'
import type { SystemModule } from '../../types/role'

interface ProtectedRouteProps {
  children: ReactNode
  module?: SystemModule
}

export function ProtectedRoute({ children, module }: ProtectedRouteProps) {
  const location = useLocation()
  const { isAuthenticated, user } = useAuthStore()
  useRoleStore((state) => state.permissionRevision)

  const isAuthorized = isAuthenticated && Boolean(user)

  if (!isAuthorized) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (module && !hasPermission(user.role, module, 'View')) return <AccessDenied />

  return <>{children}</>
}
