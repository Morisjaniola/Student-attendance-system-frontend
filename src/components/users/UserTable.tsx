import { AtSign, Mail, UserRound } from 'lucide-react'
import { formatLastLogin } from '../../services/userService'
import type { SystemUser } from '../../types/user'
import { initials } from '../../utils/format'
import { UserActionsMenu } from './UserActionsMenu'
import { UserRoleBadge, UserStatusBadge } from './UserBadges'

interface UserTableProps {
  users: SystemUser[]
  /** Currently logged-in user id (cannot deactivate self). */
  currentUserId: string | null
  canUpdate: boolean
  canActivate: boolean
  canAssignRole: boolean
  canResetPassword: boolean
  busyUserId?: string | null
  onEdit: (user: SystemUser) => void
  onToggleStatus: (user: SystemUser) => void
  onAssignRole: (user: SystemUser) => void
  onResetPassword: (user: SystemUser) => void
}

export function UserTable({ users, currentUserId, canUpdate, canActivate, canAssignRole, canResetPassword, busyUserId, onEdit, onToggleStatus, onAssignRole, onResetPassword }: UserTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-295 text-left">
        <thead className="bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:bg-slate-950/50">
          <tr>
            <th className="px-5 py-3">User</th>
            <th className="px-3 py-3">User ID</th>
            <th className="px-3 py-3">Username</th>
            <th className="px-3 py-3">Email</th>
            <th className="px-3 py-3">Role</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-3 py-3">Last login</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {users.map((user) => (
            <tr key={user.id} className="text-xs text-slate-600 transition hover:bg-slate-50/80 dark:text-slate-300 dark:hover:bg-slate-800/40">
              <td className="px-5 py-3.5">
                <span className="flex items-center gap-2.5">
                  <span className={`grid size-9 shrink-0 place-items-center rounded-xl text-[10px] font-bold ${user.avatarColor}`}>{initials(user.name)}</span>
                  <span className="max-w-44 truncate font-semibold text-slate-700 dark:text-slate-200">{user.name}</span>
                </span>
              </td>
              <td className="px-3 py-3.5 font-mono text-[11px] text-slate-400">{user.id}</td>
              <td className="px-3 py-3.5">
                <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <AtSign size={12} className="text-slate-300 dark:text-slate-600" />
                  {user.username}
                </span>
              </td>
              <td className="px-3 py-3.5">
                <span className="inline-flex max-w-52 items-center gap-1.5 truncate text-slate-500 dark:text-slate-400">
                  <Mail size={12} className="shrink-0 text-slate-300 dark:text-slate-600" />
                  <span className="truncate">{user.email}</span>
                </span>
              </td>
              <td className="px-3 py-3.5"><UserRoleBadge role={user.role} /></td>
              <td className="px-3 py-3.5"><UserStatusBadge status={user.status} /></td>
              <td className="px-3 py-3.5 whitespace-nowrap text-[11px] text-slate-400">{formatLastLogin(user.lastLogin)}</td>
              <td className="px-5 py-3.5">
                <div className="flex justify-end">
                  <UserActionsMenu
                    user={user}
                    canUpdate={canUpdate}
                    canActivate={canActivate}
                    canAssignRole={canAssignRole}
                    canResetPassword={canResetPassword}
                    canDeactivate={user.id !== currentUserId}
                    busy={busyUserId === user.id}
                    onEdit={() => onEdit(user)}
                    onToggleStatus={() => onToggleStatus(user)}
                    onAssignRole={() => onAssignRole(user)}
                    onResetPassword={() => onResetPassword(user)}
                  />
                </div>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={8} className="px-6 py-14 text-center">
                <UserRound className="mx-auto mb-2 text-slate-300" size={28} />
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No users found.</p>
                <p className="mt-1 text-xs text-slate-400">Adjust your search or filters to see matching accounts.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
