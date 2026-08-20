import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, CalendarDays, Clock3, MapPin } from 'lucide-react'
import type { SchoolEvent } from '../../types/dashboard'

const typeColor: Record<SchoolEvent['type'], string> = { Event: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300', Holiday: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300', Examination: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300', Seminar: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300', 'Class Suspension': 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' }

/**
 * Extracts the first parseable date from the event's date string and returns
 * a numeric timestamp for sorting. Handles formats like:
 *   "August 22, 2026"  → Date('August 22, 2026')
 *   "September 7–11, 2026" → Date('September 7, 2026')
 */
function eventTimestamp(event: SchoolEvent): number {
  const normalized = event.date.replace('–', ', ')
  const parsed = new Date(normalized)
  return Number.isFinite(parsed.getTime()) ? parsed.getTime() : Infinity
}

export function UpcomingEvents({ events, onView }: { events: SchoolEvent[]; onView: (event: SchoolEvent) => void }) {
  const navigate = useNavigate()

  /** Sort events by nearest upcoming date first. */
  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => eventTimestamp(a) - eventTimestamp(b)),
    [events],
  )
  return <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"><div className="flex items-start justify-between"><div><h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Upcoming school events</h2><p className="mt-1 text-xs text-slate-400">Keep the campus calendar in view</p></div><button onClick={() => navigate('/reports')} className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400">View calendar</button></div><div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{sortedEvents.map((event) => <article key={event.id} className="group relative overflow-hidden rounded-xl border border-slate-100 bg-slate-50/55 p-4 transition hover:-translate-y-0.5 hover:border-blue-100 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-950/40 dark:hover:bg-slate-800"><div className="flex items-center justify-between gap-2"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${typeColor[event.type]}`}>{event.type}</span><span className="text-[10px] font-semibold text-slate-400">{event.countdown}</span></div><h3 className="mt-3 min-h-10 text-sm font-bold leading-5 text-slate-800 dark:text-slate-100">{event.title}</h3><div className="mt-3 space-y-1.5 text-[11px] text-slate-500"><p className="flex items-center gap-1.5"><CalendarDays size={13} className="text-slate-400" />{event.date}</p><p className="flex items-center gap-1.5"><Clock3 size={13} className="text-slate-400" />{event.time}</p><p className="flex items-center gap-1.5"><MapPin size={13} className="text-slate-400" />{event.location}</p></div><button onClick={() => onView(event)} className="mt-4 inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 opacity-90 hover:underline dark:text-blue-400">View details <ArrowUpRight size={13} /></button></article>)}</div></section>
}
