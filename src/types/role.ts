import type { UserRole } from './auth'

export type PermissionAction = 'View' | 'Create' | 'Update' | 'Delete'
export type SystemModule =
  | 'Dashboard'
  | 'Student Management'
  | 'QR Code Management'
  | 'RFID Management'
  | 'Attendance Monitoring'
  | 'Attendance Records'
  | 'Analytics'
  | 'Notifications'
  | 'User Management'
  | 'System Settings'
  | 'Audit Logs'
  | 'Roles & Permissions'

export type RoleStatus = 'Active' | 'Inactive'
export type RoleName = UserRole | string

export interface Permission {
  module: SystemModule
  action: PermissionAction
}

export interface SystemRole {
  id: string
  name: RoleName
  description: string
  status: RoleStatus
  isSystem: boolean
  permissions: Permission[]
}

export interface RoleFormValues {
  name: string
  description: string
  status: RoleStatus
  permissions: Permission[]
}

export interface RoleFilters {
  query: string
  status: RoleStatus | 'All'
}

export const EMPTY_ROLE_FILTERS: RoleFilters = { query: '', status: 'All' }

export const MODULE_ACTIONS: Record<SystemModule, PermissionAction[]> = {
  Dashboard: ['View'],
  'Student Management': ['View', 'Create', 'Update', 'Delete'],
  'QR Code Management': ['View', 'Create', 'Update', 'Delete'],
  'RFID Management': ['View', 'Create', 'Update', 'Delete'],
  'Attendance Monitoring': ['View', 'Create', 'Update'],
  'Attendance Records': ['View', 'Create', 'Update', 'Delete'],
  Analytics: ['View'],
  Notifications: ['View', 'Update', 'Delete'],
  'User Management': ['View', 'Create', 'Update', 'Delete'],
  'System Settings': ['View', 'Update'],
  'Audit Logs': ['View'],
  'Roles & Permissions': ['View', 'Create', 'Update', 'Delete'],
}

export const SYSTEM_MODULES = Object.keys(MODULE_ACTIONS) as SystemModule[]
