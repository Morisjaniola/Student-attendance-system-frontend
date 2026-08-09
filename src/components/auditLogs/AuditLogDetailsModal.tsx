import { Activity, X } from 'lucide-react'
import { formatAuditDateTime } from '../../services/auditLogService'
import type { AuditLog } from '../../types/auditLog'
import { AuditActionBadge, AuditStatusBadge } from './AuditLogBadges'

interface AuditLogDetailsModalProps { log: AuditLog | null; onClose: () => void }
const displayValue = (value: string | null) => value ?? 'N/A'

export function AuditLogDetailsModal({ log, onClose }: AuditLogDetailsModalProps) {
  if (!log) return null
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: 'Date & Time', value: formatAuditDateTime(log.timestamp) }, { label: 'User', value: log.userName }, { label: 'User ID', value: log.userId }, { label: 'Role', value: log.userRole }, { label: 'Module', value: log.module }, { label: 'Action', value: <AuditActionBadge action={log.action} /> }, { label: 'Description', value: log.description }, { label: 'Status', value: <AuditStatusBadge status={log.status} /> }, { label: 'Record / Entity affected', value: displayValue(log.entity) }, { label: 'Previous value', value: displayValue(log.previousValue) }, { label: 'New value', value: displayValue(log.newValue) },
  ]
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm" role="presentation"><section role="dialog" aria-modal="true" aria-labelledby="audit-log-details-title" className="mx-auto my-4 w-full max-w-xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 sm:my-10"><header className="flex items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6"><div><h2 id="audit-log-details-title" className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white"><Activity size={19} className="text-blue-600" />Activity Details</h2><p className="mt-1 text-xs text-slate-400">Audit log {log.id}</p></div><button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close activity details"><X size={19} /></button></header><dl className="divide-y divide-slate-100 px-5 py-2 dark:divide-slate-800 sm:px-6">{rows.map((row) => <div key={row.label} className="grid gap-1 py-3.5 sm:grid-cols-[170px_1fr] sm:gap-4"><dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{row.label}</dt><dd className="text-sm font-medium text-slate-700 dark:text-slate-200">{row.value}</dd></div>)}</dl><footer className="flex justify-end border-t border-slate-100 px-5 py-3 dark:border-slate-800 sm:px-6"><button type="button" onClick={onClose} className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">Close</button></footer></section></div>
}
