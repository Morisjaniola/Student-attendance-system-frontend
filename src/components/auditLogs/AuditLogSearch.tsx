import { Search, X } from 'lucide-react'

interface AuditLogSearchProps { value: string; onChange: (value: string) => void; onClear: () => void }

export function AuditLogSearch({ value, onChange, onClear }: AuditLogSearchProps) {
  return <label className="relative block min-w-0 flex-1 sm:max-w-md"><Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input name="auditLogSearch" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Search user, module, action, or description…" aria-label="Search audit logs" className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />{value && <button type="button" onClick={onClear} className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800" aria-label="Clear audit log search"><X size={14} /></button>}</label>
}
