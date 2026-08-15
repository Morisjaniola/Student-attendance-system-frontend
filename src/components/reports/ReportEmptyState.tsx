import { ClipboardList } from 'lucide-react'

export function ReportEmptyState({ message = 'No attendance records match this report.' }: { message?: string }) {
  return <div className="grid min-h-64 place-items-center rounded-2xl border border-slate-200/80 bg-white px-5 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"><div><ClipboardList className="mx-auto mb-3 text-slate-300" size={32} /><p className="text-sm font-bold text-slate-600 dark:text-slate-300">{message}</p><p className="mt-1 text-xs text-slate-400">Try adjusting the report filters or selecting another period.</p></div></div>
}
