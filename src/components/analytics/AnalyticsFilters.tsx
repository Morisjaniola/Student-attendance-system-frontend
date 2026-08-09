import { CalendarRange, ChevronDown, RotateCcw, SlidersHorizontal } from 'lucide-react'
import type { AnalyticsFilters as AnalyticsFiltersState } from '../../types/analytics'

const selectStyle = 'h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-8 text-xs font-medium text-slate-600 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300'
const labelStyle = 'text-[11px] font-semibold text-slate-500'

interface AnalyticsFiltersProps {
  filters: AnalyticsFiltersState
  /** Course codes present in the dataset (e.g. BSIT), sorted. */
  courses: string[]
  /** Section labels present in the dataset (e.g. A), sorted. */
  sections: string[]
  onChange: (patch: Partial<AnalyticsFiltersState>) => void
  onClear: () => void
}

function activeCount(filters: AnalyticsFiltersState) {
  return Number(Boolean(filters.dateFrom || filters.dateTo)) + Number(filters.course !== 'All') + Number(filters.section !== 'All')
}

export function AnalyticsFilters({ filters, courses, sections, onChange, onClear }: AnalyticsFiltersProps) {
  const count = activeCount(filters)

  return (
    <details className="group rounded-xl border border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/40">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-blue-600" />
          Filters
          {count > 0 && <span className="grid size-5 place-items-center rounded-full bg-blue-600 text-[10px] font-bold text-white">{count}</span>}
        </span>
        <ChevronDown size={16} className="transition group-open:rotate-180" />
      </summary>

      <div className="grid gap-3 border-t border-slate-200 p-4 min-[500px]:grid-cols-2 lg:grid-cols-4 dark:border-slate-800">
        <label className={labelStyle}>
          <span className="mb-1.5 flex items-center gap-1"><CalendarRange size={13} />Date range</span>
          <span className="flex gap-2">
            <input
              type="date"
              name="analyticsDateFrom"
              value={filters.dateFrom}
              onChange={(event) => onChange({ dateFrom: event.target.value })}
              aria-label="From date"
              className={`${selectStyle} pr-3`}
            />
            <input
              type="date"
              name="analyticsDateTo"
              value={filters.dateTo}
              onChange={(event) => onChange({ dateTo: event.target.value })}
              aria-label="To date"
              className={`${selectStyle} pr-3`}
            />
          </span>
        </label>

        <label className={labelStyle}>
          Course
          <select name="analyticsCourse" value={filters.course} onChange={(event) => onChange({ course: event.target.value })} className={`${selectStyle} mt-1.5`} aria-label="Filter by course">
            <option value="All">All Courses</option>
            {courses.map((course) => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
        </label>

        <label className={labelStyle}>
          Section
          <select name="analyticsSection" value={filters.section} onChange={(event) => onChange({ section: event.target.value })} className={`${selectStyle} mt-1.5`} aria-label="Filter by section">
            <option value="All">All Sections</option>
            {sections.map((section) => (
              <option key={section} value={section}>{section}</option>
            ))}
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-slate-500 transition hover:bg-white hover:text-blue-600 dark:hover:bg-slate-900"
          >
            <RotateCcw size={14} />Clear filters
          </button>
        </div>
      </div>
    </details>
  )
}
