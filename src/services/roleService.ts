import { mockRoles } from '../data/rolesData'
import type { PermissionAction, RoleFormValues, SystemModule, SystemRole } from '../types/role'

// Frontend-only role store. Later replace this implementation with:
// React -> roleService -> PHP API -> MySQL.
let roles = mockRoles.map((role) => ({ ...role, permissions: [...role.permissions] }))
const delay = (milliseconds = 220) => new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds))
const cloneRole = (role: SystemRole): SystemRole => ({ ...role, permissions: role.permissions.map((permission) => ({ ...permission })) })

function validate(values: RoleFormValues, excludingId?: string): string | null {
  if (!values.name.trim()) return 'Role name is required.'
  const duplicate = roles.find((role) => role.id !== excludingId && role.name.toLowerCase() === values.name.trim().toLowerCase())
  return duplicate ? `Role name "${values.name.trim()}" already exists.` : null
}

export function hasPermission(roleName: string | null | undefined, module: SystemModule, action: PermissionAction): boolean {
  if (!roleName) return false
  const role = roles.find((item) => item.name === roleName)
  return Boolean(role?.status === 'Active' && role.permissions.some((permission) => permission.module === module && permission.action === action))
}

export const roleService = {
  async list(): Promise<SystemRole[]> {
    await delay()
    return roles.map(cloneRole)
  },

  async create(values: RoleFormValues): Promise<SystemRole> {
    await delay()
    const error = validate(values)
    if (error) throw new Error(error)
    const role: SystemRole = { id: `ROLE-${String(roles.length + 1).padStart(3, '0')}`, name: values.name.trim(), description: values.description.trim(), status: values.status, isSystem: false, permissions: values.permissions.map((permission) => ({ ...permission })) }
    roles = [...roles, role]
    return cloneRole(role)
  },

  async update(id: string, values: RoleFormValues): Promise<SystemRole> {
    await delay()
    const current = roles.find((role) => role.id === id)
    if (!current) throw new Error('Role not found.')
    if (current.isSystem && (values.name.trim() !== current.name || values.status !== 'Active')) throw new Error('System role names and active status are protected.')
    const error = validate(values, id)
    if (error) throw new Error(error)
    const updated: SystemRole = { ...current, name: values.name.trim(), description: values.description.trim(), status: values.status, permissions: values.permissions.map((permission) => ({ ...permission })) }
    roles = roles.map((role) => role.id === id ? updated : role)
    return cloneRole(updated)
  },

  async remove(id: string): Promise<void> {
    await delay()
    const current = roles.find((role) => role.id === id)
    if (!current) throw new Error('Role not found.')
    if (current.isSystem) throw new Error('System roles cannot be deleted.')
    roles = roles.filter((role) => role.id !== id)
  },
}
