import type { UserRole } from './auth'

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT'
export type AuditStatus = 'Success' | 'Failed'

export interface AuditLog {
  id: string
  timestamp: string
  userId: string
  userName: string
  userRole: UserRole
  module: string
  action: AuditAction
  description: string
  status: AuditStatus
  entity: string | null
  previousValue: string | null
  newValue: string | null
}

export interface AuditLogFilters {
  query: string
  userId: string | 'All'
  dateFrom: string
  dateTo: string
  module: string | 'All'
  action: AuditAction | 'All'
}

export const EMPTY_AUDIT_LOG_FILTERS: AuditLogFilters = {
  query: '',
  userId: 'All',
  dateFrom: '',
  dateTo: '',
  module: 'All',
  action: 'All',
}
