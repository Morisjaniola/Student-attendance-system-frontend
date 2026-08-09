import { ShieldCheck, UserRound, GraduationCap } from 'lucide-react'
import type { UserRole } from '../../types/auth'
import type { UserStatus } from '../../types/user'

const roleConfig: Record<UserRole, { icon: typeof ShieldCheck; classes: string }> = {
  Administrator: { icon: ShieldCheck, classes: 'bg-blue-50 text-blue-700 ring-blue-600/15 dark:bg-blue-500/10 dark:text-blue-300' },
  Faculty: { icon: GraduationCap, classes: 'bg-sky-50 text-sky-700 ring-sky-600/15 dark:bg-sky-500/10 dark:text-sky-300' },
  Staff: { icon: UserRound, classes: 'bg-slate-100 text-slate-600 ring-slate-500/15 dark:bg-slate-800 dark:text-slate-300' },
}

export function UserRoleBadge({ role }: { role: UserRole }) {
  const { icon: Icon, classes } = roleConfig[role]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${classes}`}>
      <Icon size={11} />
      {role}
    </span>
  )
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  const active = status === 'Active'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${
        active
          ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-300'
          : 'bg-rose-50 text-rose-600 ring-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300'
      }`}
    >
      <i className={`size-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-rose-400'}`} />
      {status}
    </span>
  )
}
