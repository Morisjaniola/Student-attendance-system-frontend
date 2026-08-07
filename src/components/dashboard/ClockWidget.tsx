import { CalendarDays, Clock } from 'lucide-react'
import { useLiveClock } from '../../hooks/useLiveClock'

export function ClockWidget() {
  const now = useLiveClock()
  const time = new Intl.DateTimeFormat('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).format(now)
  const date = new Intl.DateTimeFormat('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(now)
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><span className="grid size-7 place-items-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300"><Clock size={15} /></span>LIVE CAMPUS TIME</div>
      <p className="mt-3 font-mono text-[27px] font-bold tracking-tight text-slate-900 dark:text-white">{time}</p>
      <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400"><CalendarDays size={13} />{date}</div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800"><span className="text-slate-400">Semester</span><span className="font-semibold text-slate-700 dark:text-slate-200">1st Semester</span></div>
      <div className="mt-2 flex items-center justify-between text-xs"><span className="text-slate-400">School Year</span><span className="font-semibold text-slate-700 dark:text-slate-200">2026–2027</span></div>
    </section>
  )
}
