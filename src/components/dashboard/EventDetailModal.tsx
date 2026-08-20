import { useEffect, useRef } from 'react'
import { X, CalendarDays, Clock3, MapPin, Target } from 'lucide-react'
import type { SchoolEvent } from '../../types/dashboard'

const typeColor: Record<SchoolEvent['type'], string> = {
  Event: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
  Holiday: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  Examination: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
  Seminar: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300',
  'Class Suspension': 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
}

export function EventDetailModal({ event, onClose }: { event: SchoolEvent; onClose: () => void }) {
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === backdropRef.current) onClose() }}
    >
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-100 bg-white/90 px-6 py-5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${typeColor[event.type]}`}>{event.type}</span>
              {event.status && (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{event.status}</span>
              )}
            </div>
            <h2 className="mt-2 text-lg font-bold tracking-tight text-slate-900 dark:text-white">{event.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 px-6 py-5">
          {/* Info cards */}
          <section className="grid gap-3 sm:grid-cols-3">
            <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/55 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10"><CalendarDays size={16} /></div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Date</p>
                <p className="mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-100">{event.date}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/55 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-500/10"><Clock3 size={16} /></div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Time</p>
                <p className="mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-100">{event.time}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/55 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"><MapPin size={16} /></div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Location</p>
                <p className="mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-100">{event.location}</p>
              </div>
            </div>
          </section>

          {/* Purpose */}
          {event.purpose && (
            <section className="rounded-xl border border-slate-100 bg-slate-50/55 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="mb-2 flex items-center gap-2">
                <Target size={15} className="text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Purpose</h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{event.purpose}</p>
            </section>
          )}

          {/* Event-specific details */}
          {event.details && event.details.length > 0 && (
            <section className="rounded-xl border border-slate-100 bg-slate-50/55 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <h3 className="mb-3 text-sm font-bold text-slate-800 dark:text-slate-100">Event Details</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {event.details.map((detail) => (
                  <div key={detail.label} className="rounded-lg border border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{detail.label}</p>
                    <p className="mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-100">{detail.value}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex justify-end border-t border-slate-100 bg-white/90 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
          >
            <X size={14} />
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
