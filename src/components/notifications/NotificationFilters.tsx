import type { NotificationFilter } from '../../types/notification'

const OPTIONS: { value: NotificationFilter; label: string }[] = [
  { value: 'All', label: 'All' },
  { value: 'Unread', label: 'Unread' },
  { value: 'Late Student', label: 'Late Student' },
  { value: 'Attendance Confirmation', label: 'Attendance Confirmation' },
]

interface NotificationFiltersProps {
  value: NotificationFilter
  onChange: (filter: NotificationFilter) => void
  /** Live counts shown next to each option (All -> total, Unread -> unread count). */
  counts: Partial<Record<NotificationFilter, number>>
}

export function NotificationFilters({ value, onChange, counts }: NotificationFiltersProps) {
  return (
    <div role="group" aria-label="Filter notifications" className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-slate-50/70 p-1.5 dark:border-slate-800 dark:bg-slate-950/40">
      {OPTIONS.map((option) => {
        const active = value === option.value
        const count = counts[option.value] ?? 0
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition ${
              active
                ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:text-blue-300 dark:ring-slate-700'
                : 'text-slate-500 hover:bg-white/70 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
            }`}
          >
            {option.label}
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' : 'bg-slate-200/70 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>{count}</span>
          </button>
        )
      })}
    </div>
  )
}
