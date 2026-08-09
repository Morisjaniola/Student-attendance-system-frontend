import type { AuditAction, AuditStatus } from '../../types/auditLog'

const actionStyles: Record<AuditAction, string> = {
  CREATE: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-300',
  UPDATE: 'bg-blue-50 text-blue-700 ring-blue-600/15 dark:bg-blue-500/10 dark:text-blue-300',
  DELETE: 'bg-rose-50 text-rose-700 ring-rose-600/15 dark:bg-rose-500/10 dark:text-rose-300',
  LOGIN: 'bg-sky-50 text-sky-700 ring-sky-600/15 dark:bg-sky-500/10 dark:text-sky-300',
  LOGOUT: 'bg-slate-100 text-slate-600 ring-slate-500/15 dark:bg-slate-800 dark:text-slate-300',
}

export function AuditActionBadge({ action }: { action: AuditAction }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${actionStyles[action]}`}>{action}</span>
}

export function AuditStatusBadge({ status }: { status: AuditStatus }) {
  const success = status === 'Success'
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${success ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 ring-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300'}`}><i className={`size-1.5 rounded-full ${success ? 'bg-emerald-500' : 'bg-rose-500'}`} />{status}</span>
}
