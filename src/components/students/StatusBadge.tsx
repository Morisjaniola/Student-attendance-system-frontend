import type { StudentStatus } from '../../types/student'

const styles: Record<StudentStatus, string> = {
  Active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-300',
  Inactive: 'bg-slate-100 text-slate-600 ring-slate-500/15 dark:bg-slate-700/50 dark:text-slate-300',
  Suspended: 'bg-amber-50 text-amber-700 ring-amber-600/15 dark:bg-amber-500/10 dark:text-amber-300',
  Archived: 'bg-rose-50 text-rose-700 ring-rose-600/15 dark:bg-rose-500/10 dark:text-rose-300',
}

const dot: Record<StudentStatus, string> = { Active: 'bg-emerald-500', Inactive: 'bg-slate-400', Suspended: 'bg-amber-500', Archived: 'bg-rose-500' }

export function StatusBadge({ status }: { status: StudentStatus }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${styles[status]}`}><i className={`size-1.5 rounded-full ${dot[status]}`} />{status}</span>
}
