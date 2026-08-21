import { CheckCircle2, CircleOff, Clock3, FileText, HeartHandshake, UsersRound } from 'lucide-react'
import type { ReportSummary } from '../../types/report'

const cards = [
  { key: 'total' as const, label: 'Total Records', icon: FileText, tone: 'text-slate-600 dark:text-slate-300' },
  { key: 'present' as const, label: 'Present', icon: CheckCircle2, tone: 'text-emerald-600 dark:text-emerald-300' },
  { key: 'absent' as const, label: 'Absent', icon: CircleOff, tone: 'text-rose-600 dark:text-rose-300' },
  { key: 'late' as const, label: 'Late', icon: Clock3, tone: 'text-amber-600 dark:text-amber-300' },
  { key: 'excused' as const, label: 'Excused', icon: HeartHandshake, tone: 'text-blue-600 dark:text-blue-300' },
]

export function ReportSummaryCards({ summary }: { summary: ReportSummary }) {
  return (
    <section className="grid gap-3 min-[480px]:grid-cols-2 xl:grid-cols-6">
      {cards.map(({ key, label, icon: Icon, tone }) => <article key={key} className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><Icon size={16} className={tone} /><p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{summary[key]}</p><p className="mt-0.5 text-[11px] font-semibold text-slate-500">{label}{key === 'total' ? ` · ${summary.students} student${summary.students === 1 ? '' : 's'}` : ''}</p></article>)}
      <article className="rounded-xl border border-blue-100 bg-blue-50 p-4 shadow-sm dark:border-blue-500/20 dark:bg-blue-500/10"><UsersRound size={16} className="text-blue-600 dark:text-blue-300" /><p className="mt-3 text-2xl font-bold tracking-tight text-blue-700 dark:text-blue-200">{summary.attendanceRate}%</p><p className="mt-0.5 text-[11px] font-semibold text-blue-700/75 dark:text-blue-300">Attendance Rate</p></article>
    </section>
  )
}
