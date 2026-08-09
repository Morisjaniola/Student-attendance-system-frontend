import { ChevronDown, RotateCcw, SlidersHorizontal } from 'lucide-react'
import type { AttendanceStatus } from '../../types/dashboard'
import type { AttendanceRecordFilters } from '../../types/attendanceRecord'

const selectStyle = 'h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-8 text-xs font-medium text-slate-600 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300'

const labelStyle = 'text-[11px] font-semibold text-slate-500'

interface AttendanceFiltersProps {
  filters: AttendanceRecordFilters
  /** ISO dates present in the dataset, sorted newest first. */
  dates: string[]
  /** ISO date -> human label, e.g. 2026-08-09 -> August 9, 2026. */
  dateLabels: Record<string, string>
  sections: string[]
  /** Course codes present in the dataset (e.g. BSIT). */
  courses: string[]
  onChange: <K extends keyof AttendanceRecordFilters>(key: K, value: AttendanceRecordFilters[K]) => void
  onClear: () => void
}

const STATUS_OPTIONS: AttendanceStatus[] = ['Present', 'Late', 'Excused', 'Absent']

export function AttendanceFilters({ filters, dates, dateLabels, sections, courses, onChange, onClear }: AttendanceFiltersProps) {
  const activeCount = Object.values(filters).filter((value) => value !== 'All').length

  return (
    <details className="group rounded-xl border border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/40">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-blue-600" />
          Filters
          {activeCount > 0 && (
            <span className="grid size-5 place-items-center rounded-full bg-blue-600 text-[10px] font-bold text-white">{activeCount}</span>
          )}
        </span>
        <ChevronDown size={16} className="transition group-open:rotate-180" />
      </summary>

      <div className="grid gap-3 border-t border-slate-200 p-4 min-[500px]:grid-cols-2 lg:grid-cols-4 dark:border-slate-800">
        <label className={labelStyle}>
          Date
          <select name="filterDate" value={filters.date} onChange={(event) => onChange('date', event.target.value)} className={`${selectStyle} mt-1.5`} aria-label="Filter by date">
            <option value="All">All Dates</option>
            {dates.map((date) => (
              <option key={date} value={date}>{dateLabels[date] ?? date}</option>
            ))}
          </select>
        </label>

        <label className={labelStyle}>
          Section
          <select name="filterSection" value={filters.section} onChange={(event) => onChange('section', event.target.value)} className={`${selectStyle} mt-1.5`} aria-label="Filter by section">
            <option value="All">All Sections</option>
            {sections.map((section) => (
              <option key={section}>{section}</option>
            ))}
          </select>
        </label>

        <label className={labelStyle}>
          Status
          <select name="filterStatus" value={filters.status} onChange={(event) => onChange('status', event.target.value as AttendanceStatus | 'All')} className={`${selectStyle} mt-1.5`} aria-label="Filter by status">
            <option value="All">All Statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>

        <label className={labelStyle}>
          Course
          <select name="filterCourse" value={filters.course} onChange={(event) => onChange('course', event.target.value)} className={`${selectStyle} mt-1.5`} aria-label="Filter by course">
            <option value="All">All Courses</option>
            {courses.map((course) => (
              <option key={course}>{course}</option>
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
