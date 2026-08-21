import { MODULE_ACTIONS, SYSTEM_MODULES } from '../types/role'
import type { Permission, SystemRole } from '../types/role'

const allPermissions: Permission[] = SYSTEM_MODULES.flatMap((module) => MODULE_ACTIONS[module].map((action) => ({ module, action })))
const viewPermissions = (modules: Permission['module'][]) => modules.map((module) => ({ module, action: 'View' as const }))

export const mockRoles: SystemRole[] = [
  { id: 'ROLE-001', name: 'Administrator', description: 'Full system administration and configuration access.', status: 'Active', isSystem: true, permissions: allPermissions },
  { id: 'ROLE-002', name: 'Faculty', description: 'Access to student and attendance operations assigned to faculty.', status: 'Active', isSystem: true, permissions: viewPermissions(['Dashboard', 'Student Management', 'Attendance Monitoring', 'Attendance Records', 'Analytics', 'Notifications']) },
  {
    id: 'ROLE-003',
    name: 'Staff',
    description: 'Access to day-to-day attendance, credential, and student support operations.',
    status: 'Active',
    isSystem: true,
    permissions: [
      ...viewPermissions(['Dashboard', 'Student Management', 'QR Code Management', 'RFID Management', 'Attendance Monitoring', 'Attendance Records', 'Analytics', 'Notifications']),
      { module: 'QR Code Management', action: 'Create' },
      { module: 'QR Code Management', action: 'Update' },
      { module: 'RFID Management', action: 'Create' },
      { module: 'RFID Management', action: 'Update' },
      { module: 'Attendance Monitoring', action: 'Create' },
      { module: 'Notifications', action: 'Update' },
    ],
  },
]
